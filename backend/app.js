import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./Modules/Auth/auth.route.js";
import userRoutes from "./Modules/User/userRoutes.js";
import adminRoutes from "./Modules/User/adminRoutes.js";
import interviewRouter from "./Modules/Interview/interviews.routes.js";
import forgotPasswordRoutes from "./Modules/ForgotPassword/forgotPassword.routes.js";
import analysesRoutes from "./Modules/Analysis/analyses.routes.js";
import roadmapsRoutes from "./Modules/Roadmap/roadmaps.routes.js";
import oauthRoutes from "./Modules/Oauth/oauthRoutes.js";
import cvRoutes from "./Modules/CV/cv.routes.js";
import jobDescriptionRoutes from "./Modules/jobDescription/job.routes.js";
import paymentRoutes from "./Modules/Payment/payment.routes.js";
import stripeWebhook from "./Modules/Payment/stripe.webhook.js";
import planRoutes from "./Modules/subscription/plan.routes.js";

import { AppError } from "./utils/validators.js";
import { globalErrorHandler } from "./Modules/Error/error.controller.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());

app.use("/api/webhooks/stripe", stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", forgotPasswordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/interviews", interviewRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/roadmaps", roadmapsRoutes);
app.use("/api/analysis", analysesRoutes);
app.use("/api", oauthRoutes);
app.use("/api/cvs", cvRoutes);
app.use("/api/job-descriptions", jobDescriptionRoutes);
app.use("/api/plans", planRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "CareerForge API is running!",
    });
});

app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;