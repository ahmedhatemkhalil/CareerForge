/**
 * FORGOT PASSWORD MODEL
 * ====================
 *
 * PURPOSE:
 * This model stores forgot password OTP requests temporarily.
 * It helps track password reset tokens and their expiry.
 *
 * FIELDS:
 * - email: User's email address
 * - otpHash: Hashed OTP code for security
 * - otp: Plain OTP (for development/testing, remove in production)
 * - expiresAt: When this OTP expires
 *
 * RELATED FILES:
 * - Modules/ForgotPassword/forgotPassword.controller.js
 * - Modules/ForgotPassword/forgotPassword.routes.js
 */

import mongoose from "mongoose";

const forgotPasswordSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      index: { expireAfterSeconds: 0 }, // Auto-delete expired documents
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
forgotPasswordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("ForgotPassword", forgotPasswordSchema);
