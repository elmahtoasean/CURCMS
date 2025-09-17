import prisma from "../DB/db.config.js";
import { Vine, errors } from "@vinejs/vine";
import {
  registerSchema,
  loginSchema,
  validateRollNumber,
} from "../validations/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { emailQueue, emailQueueName } from "../jobs/SendEmailJob.js";
import logger from "../config/logger.js";

const vine = new Vine();

// In-memory storage for pending registrations (use Redis in production)
const pendingRegistrations = new Map();

const AUTH_USER_INCLUDE = {
  teacher: {
    include: {
      reviewer: true,
    },
  },
  student: true,
  generaluser: true,
  admin: true,
};

const JWT_SECRET_ERROR = "JWT_SECRET_NOT_CONFIGURED";
const DEFAULT_JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const extractSingleRelation = (relation) => {
  if (!relation) {
    return null;
  }
  if (Array.isArray(relation)) {
    return relation.length > 0 ? relation[0] : null;
  }
  return relation;
};

const sanitizeObject = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

const buildAuthResponse = (user) => {
  const teacherRecord = extractSingleRelation(user.teacher);
  const studentRecord = extractSingleRelation(user.student);
  const generalRecord = extractSingleRelation(user.generaluser);
  const adminRecord = extractSingleRelation(user.admin);

  const availableRoles = new Set();

  if (user.role) {
    availableRoles.add(user.role);
  }

  if (teacherRecord) {
    availableRoles.add("TEACHER");

    if (teacherRecord.isReviewer) {
      availableRoles.add("REVIEWER");
    }
  }

  if (studentRecord) {
    availableRoles.add("STUDENT");
  }

  if (generalRecord) {
    availableRoles.add("GENERALUSER");
  }

  if (user.isMainAdmin || adminRecord) {
    availableRoles.add("ADMIN");
  }

  const activeRole =
    user.role ||
    (teacherRecord
      ? "TEACHER"
      : studentRecord
      ? "STUDENT"
      : generalRecord
      ? "GENERALUSER"
      : adminRecord
      ? "ADMIN"
      : "GENERALUSER");

  if (activeRole) {
    availableRoles.add(activeRole);
  }

  const baseUser = {
    id: user.user_id,
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: activeRole,
    isMainAdmin: Boolean(user.isMainAdmin),
    emailVerified: Boolean(user.isVerified),
  };

  if (teacherRecord) {
    baseUser.teacher_id = teacherRecord.teacher_id;
    if (teacherRecord.department_id) {
      baseUser.department_id = teacherRecord.department_id;
    }
    if (teacherRecord.designation) {
      baseUser.designation = teacherRecord.designation;
    }
    baseUser.isReviewer = Boolean(teacherRecord.isReviewer);
    if (teacherRecord.reviewer) {
      baseUser.reviewer_id = teacherRecord.reviewer.reviewer_id;
    }
  }

  if (studentRecord) {
    baseUser.student_id = studentRecord.student_id;
    if (studentRecord.roll_number) {
      baseUser.roll_number = studentRecord.roll_number;
    }
    if (!baseUser.department_id && studentRecord.department_id) {
      baseUser.department_id = studentRecord.department_id;
    }
  }

  const sanitizedUser = sanitizeObject({
    ...baseUser,
    availableRoles: Array.from(availableRoles),
  });

  const tokenPayload = sanitizeObject({
    id: user.user_id,
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: activeRole,
    isMainAdmin: Boolean(user.isMainAdmin),
    emailVerified: Boolean(user.isVerified),
    teacher_id: teacherRecord?.teacher_id,
    department_id:
      teacherRecord?.department_id || studentRecord?.department_id || undefined,
    isReviewer: teacherRecord ? Boolean(teacherRecord.isReviewer) : undefined,
    reviewer_id: teacherRecord?.reviewer?.reviewer_id,
    student_id: studentRecord?.student_id,
  });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(JWT_SECRET_ERROR);
  }

  const token = jwt.sign(tokenPayload, secret, {
    expiresIn: DEFAULT_JWT_EXPIRES_IN,
  });

  return {
    token,
    user: sanitizedUser,
    availableRoles: sanitizedUser.availableRoles,
  };
};

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      const findUser = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (findUser) {
        return res.status(400).json({
          errors: { email: "Email already taken. Please use another one." },
        });
      }

      const existingPending = Array.from(pendingRegistrations.values()).find(
        (reg) => reg.email === payload.email
      );
      if (existingPending) {
        return res.status(400).json({
          errors: { email: "Email is already pending verification." },
        });
      }

      // generate verification token
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      pendingRegistrations.set(verifyToken, {
        ...payload,
        expiresAt,
        email: payload.email,
      });

      try {
        await emailQueue.add(emailQueueName, {
          to: payload.email,
          subject: "Verify your email",
          html: `
            <h2>Welcome to UCMS</h2>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${process.env.BACKEND_URL}/api/auth/verify/${verifyToken}">Verify Email</a>
          `,
        });

        return res.json({
          status: 200,
          message: "Registration successful. Please verify your email.",
        });
      } catch (err) {
        pendingRegistrations.delete(verifyToken);
        return res.status(500).json({
          status: 500,
          message: "Failed to send verification email. Please try again.",
          emailSent: false,
          emailError: true,
        });
      }
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        logger.error("Register validation error:", error);
        return res.status(400).json({ errors: error.messages });
      }
      logger.error("Register error:", error);
      return res.status(500).json({
        error: "Something went wrong. Please try again.",
        registrationFailed: true,
      });
    }
  }

  static async login(req, res) {
    try {
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(req.body);

      const normalizedEmail = payload.email.trim();

      const user = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: "insensitive" } },
        include: AUTH_USER_INCLUDE,
      });

      if (!user || !user.password) {
        return res.status(400).json({
          errors: { email: "Invalid email or password." },
        });
      }

      const passwordMatch = bcrypt.compareSync(payload.password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          errors: { email: "Invalid email or password." },
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          error: "Please verify your email before logging in.",
        });
      }

      const { token, user: authUser, availableRoles } = buildAuthResponse(user);

      return res.json({
        status: 200,
        message: "Login successful.",
        token,
        user: authUser,
        availableRoles,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      }
      if (error.message === JWT_SECRET_ERROR) {
        logger.error("Login failed: JWT secret not configured.");
        return res.status(500).json({
          error:
            "Authentication service is not configured properly. Please contact the administrator.",
        });
      }
      logger.error("Login error:", error);
      return res.status(500).json({
        error: "Unable to login at the moment. Please try again later.",
      });
    }
  }

  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const registrationData = pendingRegistrations.get(token);

      if (!registrationData) {
        return res.status(400).send(`
          <html><body><h2>Invalid or Expired Verification Link</h2></body></html>
        `);
      }

      if (new Date() > registrationData.expiresAt) {
        pendingRegistrations.delete(token);
        return res.status(400).send(`
          <html><body><h2>Verification link expired</h2></body></html>
        `);
      }

      // Validate roll number
      if (registrationData.roll_number) {
        const rollExists = await prisma.student.findUnique({
          where: { roll_number: registrationData.roll_number },
        });
        if (rollExists) {
          pendingRegistrations.delete(token);
          return res.status(400).send(`
            <html><body><h2>Roll Number Already Taken</h2></body></html>
          `);
        }
      }

      const hashedPassword = bcrypt.hashSync(registrationData.password, 10);
      await prisma.user.create({
        data: {
          name: registrationData.name,
          email: registrationData.email,
          password: hashedPassword,
          isVerified: true,
          role: registrationData.role || "GENERALUSER",
        },
      });

      pendingRegistrations.delete(token);

      return res.send(`
        <html><body><h2>Email Verified</h2></body></html>
      `);
    } catch (err) {
      logger.error("Verify email error:", err);
      return res.status(400).send(`
        <html><body><h2>Verification Failed</h2></body></html>
      `);
    }
  }

  static async switchRole(req, res) {
    try {
      const userIdRaw = req.user?.id ?? req.user?.user_id;
      const userId = Number(userIdRaw);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      // Normalize role string
      const newRoleInput = (req.body?.newRole || "").toString().trim().toUpperCase();

      // Only allow TEACHER or REVIEWER
      if (!["TEACHER", "REVIEWER"].includes(newRoleInput)) {
        return res.status(400).json({ error: "Invalid role to switch." });
      }

      // Fetch user
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if ((user.role || "").toUpperCase() === newRoleInput) {
        return res.status(400).json({ error: `Already in role ${newRoleInput}.` });
      }

      const teacherRecord = await prisma.teacher.findFirst({
        where: { user_id: userId },
        select: { isReviewer: true, teacher_id: true },
      });

      if (newRoleInput === "REVIEWER") {
        if (!teacherRecord || teacherRecord.isReviewer !== true) {
          return res.status(403).json({
            error:
              "User is not authorized to switch to REVIEWER role. Must be a teacher marked as reviewer.",
          });
        }
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          error: "Auth configuration error: JWT secret not configured.",
        });
      }

      await prisma.user.update({
        where: { user_id: userId },
        data: { role: newRoleInput },
      });

      const payloadData = {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: newRoleInput,
        emailVerified: !!user.isVerified,
        isMainAdmin: !!user.isMainAdmin,
      };

      const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      return res.status(200).json({
        success: true,
        message: `Role switched to ${newRoleInput} successfully.`,
        token,
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: newRoleInput,
          isMainAdmin: !!user.isMainAdmin,
          emailVerified: !!user.isVerified,
        },
      });
    } catch (error) {
      console.error("SwitchRole error:", error);
      return res.status(500).json({
        error: "Something went wrong while switching roles.",
      });
    }
  }
}

export default AuthController;
