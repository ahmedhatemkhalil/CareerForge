/**
 * FORGOT PASSWORD ROUTES
 * ======================
 *
 * PURPOSE:
 * This file defines all API endpoints for forgot password functionality.
 * It maps URLs to controller functions.
 *
 * ENDPOINTS:
 * - POST /forgot-password          → Send OTP to user
 * - POST /verify-reset-otp         → Verify OTP code
 * - POST /reset-password-otp       → Reset password with OTP
 * - POST /resend-otp               → Resend OTP to email
 *
 * RELATED FILES:
 * - forgotPassword.controller.js (business logic)
 * - routes/auth.routes.js (main auth routes)
 */

import express from "express";
import {
  forgotPassword,
  verifyResetOtp,
  resetPasswordWithOtp,
  resendOtp,
} from "./forgotPassword.controller.js";

const forgotPasswordRoutes = express.Router();

forgotPasswordRoutes.post("/forgot-password", forgotPassword);
forgotPasswordRoutes.post("/verify-reset-otp", verifyResetOtp);
forgotPasswordRoutes.post("/reset-password-otp", resetPasswordWithOtp);
forgotPasswordRoutes.post("/resend-otp", resendOtp);

export default forgotPasswordRoutes;
