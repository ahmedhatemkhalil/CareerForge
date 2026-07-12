/**
 * FORGOT PASSWORD CONTROLLER
 * =========================
 *
 * PURPOSE:
 * This file contains the logic for password reset via OTP.
 * It handles sending OTP, verifying OTP, and resetting password.
 *
 * FUNCTIONS:
 * - forgotPassword: Generate and send OTP to user email
 * - verifyResetOtp: Verify the OTP sent to user
 * - resetPasswordWithOtp: Reset password after OTP verification
 * - resendOtp: Resend OTP if user didn't receive it
 *
 * RELATED FILES:
 * - models/ForgotPassword.js (database)
 * - models/User.js (user data)
 * - routes/forgotPassword.routes.js (endpoints)
 */

import crypto from "crypto";
import ForgotPassword from "../../models/ForgotPassword.js";
import User from "../../models/User.js";
// import UserSettings from "../../models/UserSettings.js";
import sendEmail from "../../Email/email.js";
import { resetPasswordOtpTemplate } from "../../Email/emailTemplate.js";
import { isValidEmail, isStrongPassword } from "../../utils/validators.js";
import bcrypt from "bcrypt";

// @desc    Forgot Password - Generate and Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no user with that email." });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Email from frontend:", email);
    console.log("OTP from frontend:", otp);

    // Hash OTP for storage
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Set expiry time (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save OTP to database

    const forgotPasswordRecord = await ForgotPassword.create({
      user_id: user._id,
      email,
      otpHash,
      otp,
      expiresAt,
    });

    // Send email with OTP
    try {
      await sendEmail({
        email: user.email,
        subject: "Your CareerForge OTP Code",
        html: resetPasswordOtpTemplate(otp),
      });

      res.status(200).json({
        message: "OTP sent to your email. Check your inbox!",
        success: true,
      });
    } catch (err) {
      console.error("Forgot password email failed:", err.message);
      await ForgotPassword.deleteOne({ _id: forgotPasswordRecord._id });
      return res
        .status(500)
        .json({ message: "Email could not be sent. Please try again." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify OTP before password reset
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Hash the provided OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Find the OTP record
    const forgotPasswordRecord = await ForgotPassword.findOne({
      email,
      otpHash: hashedOtp,
    });

    // Check if record exists and not expired
    if (!forgotPasswordRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (forgotPasswordRecord.expiresAt < new Date()) {
      await ForgotPassword.deleteOne({ _id: forgotPasswordRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid
    res.status(200).json({
      message: "OTP verified successfully",
      success: true,
      userId: forgotPasswordRecord.user_id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reset password using verified OTP
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Validate inputs
    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP, and password are required",
      });
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "Password is not strong enough" });
    }

    // Hash the provided OTP
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Find the OTP record
    const forgotPasswordRecord = await ForgotPassword.findOne({
      email,
      otpHash: hashedOtp,
    });

    // Validate OTP
    if (!forgotPasswordRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (forgotPasswordRecord.expiresAt < new Date()) {
      await ForgotPassword.deleteOne({ _id: forgotPasswordRecord._id });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, 10);

    // Clear any existing reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Delete the OTP record
    await ForgotPassword.deleteOne({ _id: forgotPasswordRecord._id });

    res.status(200).json({
      message: "Password updated successfully! You can login now.",
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Resend OTP to user email
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no user with that email." });
    }

    // Delete previous OTP records for this email
    await ForgotPassword.deleteMany({ email });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save new OTP record
    const forgotPasswordRecord = await ForgotPassword.create({
      user_id: user._id,
      email,
      otpHash,
      otp,
      expiresAt,
    });

    // Send email with new OTP
    try {
      await sendEmail({
        email: user.email,
        subject: "Your CareerForge OTP Code",
        html: resetPasswordOtpTemplate(otp),
      });

      res.status(200).json({
        message: "New OTP sent to your email.",
        success: true,
      });
    } catch (err) {
      await ForgotPassword.deleteOne({ _id: forgotPasswordRecord._id });
      return res
        .status(500)
        .json({ message: "Email could not be sent. Please try again." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
