import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import programmeRoutes from "./routes/programmes.routes.js";
import applicationRoutes from "./routes/applications.routes.js";
import documentRoutes from "./routes/documents.routes.js";
import eligibilityRoutes from "./routes/eligibility.routes.js";
import evaluationRoutes from "./routes/evaluations.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { HttpError } from "./lib/http.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
    return callback(new HttpError(403, `Origin ${origin} is not allowed by CORS.`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ success: true, service: "credifit-api", status: "ok" });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
});
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/programmes", programmeRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/eligibility", eligibilityRoutes);
app.use("/api/v1/evaluator", evaluationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/workflow", workflowRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
