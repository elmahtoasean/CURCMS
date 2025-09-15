import logger from "../config/logger.js";
import { sendEmail } from "../config/mailer.js";

export const emailQueueName = "email-queue";

function ensureArray(data) {
  if (!Array.isArray(data)) {
    throw new Error("Invalid job data format");
  }
  return data;
}

export const emailQueue = {
  async add(_queueName, data) {
    const jobs = ensureArray(data);
    if (jobs.length === 0) {
      logger.warn("Email queue received an empty batch");
      return [];
    }

    const results = [];

    for (const item of jobs) {
      const toEmail = item?.toEmail;
      if (!toEmail) {
        const error = new Error("Missing recipient email address");
        logger.error("Email send failed due to missing recipient", { item });
        results.push({ email: null, status: "failed", error: error.message });
        continue;
      }

      try {
        logger.info(`Sending email to: ${toEmail}`);
        await sendEmail(toEmail, item.subject, item.body);
        logger.info(`Email sent successfully to: ${toEmail}`);
        results.push({ email: toEmail, status: "success" });
      } catch (error) {
        logger.error(`Email send failed for ${toEmail}:`, error);
        results.push({ email: toEmail, status: "failed", error: error.message });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    if (successCount === 0) {
      throw new Error("All email sends failed");
    }

    logger.info({
      message: "Email batch processed",
      queue: emailQueueName,
      successCount,
      failureCount: results.length - successCount,
    });

    return results;
  },
};
