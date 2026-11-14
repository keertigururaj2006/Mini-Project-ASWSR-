import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_ORIGINS: z.string().default("http://localhost:5173"),
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().default("credifit"),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must contain at least 32 characters"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_ISSUER: z.string().default("credifit-api"),
  JWT_AUDIENCE: z.string().default("credifit-client"),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(7),
  COOKIE_NAME: z.string().default("credifit_refresh"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  CLIENT_APP_URL: z.string().url().default("http://localhost:5173"),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default(""),
  UPLOAD_DIR: z.string().default("./storage/uploads"),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid backend environment configuration:\n${details}`);
}

const value = parsed.data;
const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.isAbsolute(value.UPLOAD_DIR)
  ? value.UPLOAD_DIR
  : path.resolve(configDirectory, "../../", value.UPLOAD_DIR);

export const env = {
  ...value,
  isProduction: value.NODE_ENV === "production",
  clientOrigins: value.CLIENT_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
  uploadDirectory,
};
