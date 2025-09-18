import express from 'express';
import "dotenv/config";
import fileUpload from 'express-fileupload';
import helmet from "helmet";
import cors from "cors";
import {limiter} from "./config/ratelimiter.js";
import './jobs/SendEmailJob.js';



const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_BASE_URL = (process.env.FRONTEND_URL || "https://curcms-1.onrender.com").replace(/\/$/, "");

app.set("trust proxy", true);



//! Middleware before routes
app.use (fileUpload()); // Giving authority of getting uploaded files by user
app.use(express.json()); // api to json
app.use(express.urlencoded({ extended: false })); // html form response to json


const defaultCorsOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://curcms-1.onrender.com",
]);

const envOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ORIGIN,
  process.env.CORS_ALLOWED_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0)
  );

envOrigins.forEach((origin) => defaultCorsOrigins.add(origin));

const corsAllowedOrigins = Array.from(defaultCorsOrigins);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      // Allow non-browser or same-origin requests
      return callback(null, true);
    }

    if (corsAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
//app.use(cors()); // Allows or restricts access to your backend from different origins (frontends/apps)

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // <-- key line
  crossOriginEmbedderPolicy: false,                      // avoid NotSameOrigin blocks
})); // Secures the app by setting safe HTTP headers
app.use('/uploads', (req, res, next) => {
  if (req.path.endsWith('.pdf')) {
    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
  }
  next();
});

// Your static file serving
app.use('/uploads', express.static('uploads'));

// // ! Basic Express middleware
// app.use(express.json()); // api to json
// app.use(express.urlencoded({ extended: false })); // html form response to json
// app.use(fileUpload()); // Giving authority of getting uploaded files by user

//! Security middleware
//app.use(helmet()); // Secures the app by setting safe HTTP headers

// ! Rate limiting
app.use(limiter); // Apply the rate limiting middleware to all requests.

// ! Static files
// Give permission to express js so that it can show images by url
// means ww will tell express js that if someone want to "GET" static files from u than you can give it
app.use(express.static("public")); // public directory te ja data ache ta publicly serve krte parbo
//! To serve a default profile picture from your local public/images directory (instead of using an external URL)
//! You're using Express, so serve the /public folder like this
app.use(
  "/images",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("public/images")
);
app.use("/documents", (req, res, next) => {
  res.removeHeader("X-Frame-Options"); // in case Helmet set it
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' http://localhost:5173 http://127.0.0.1:5173"
  );

  if (req.path.endsWith(".pdf")) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
  }

  next();
});

app.use("/documents", express.static("public/documents"));

app.get('/', (req, res) => {
  return res.json({ message: 'Welcome to the University Research Cell Management System API' });
});


//! Import routes
import ApiRoutes from './routes/api.js';
app.use("/api", ApiRoutes);

//! jobs import
import "./jobs/index.js";


// //! logger
// import logger from './config/logger.js';
// logger.info ("Hey I am just testing...") //will save this in combine.log
// logger.error ("Hey I am just testing Error Log...") //will save this in error.log

const frontendRedirectIgnorePrefixes = ["/api", "/uploads", "/documents", "/images"]; // Paths served by the backend

app.get("*", (req, res, next) => {
  if (req.method !== "GET") {
    return next();
  }

  if (req.path === "/" || frontendRedirectIgnorePrefixes.some((prefix) => req.path.startsWith(prefix))) {
    return next();
  }

  const originalPath = req.originalUrl.startsWith("/") ? req.originalUrl : `/${req.originalUrl}`;
  return res.redirect(`${FRONTEND_BASE_URL}/#${originalPath}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//! To serve a default profile picture from your local public/images directory (instead of using an external URL)
//! You're using Express, so serve the /public folder like this
app.use("/images", express.static("public/images"));
