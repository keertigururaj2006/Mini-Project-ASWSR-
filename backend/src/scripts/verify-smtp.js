import { verifyEmailTransport } from "../services/email.js";

try {
  await verifyEmailTransport();
  console.log("[AUTH TEST] SMTP connection and authentication succeeded.");
  process.exit(0);
} catch (error) {
  console.error("[AUTH TEST] SMTP verification failed:", error.message);
  process.exit(1);
}
