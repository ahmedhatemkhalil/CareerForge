/**
 * AUTHENTICATION CONTROLLER
 * =========================
 * 
 * PURPOSE:
 * This file contains the actual logic for authentication endpoints.
 * It handles signup, login, profile management, and account deletion.
 * 
 * ASSIGNED TO: AMANY
 * 
 * WHAT EACH FUNCTION DOES:
 * -------------------------------------------------
 * | Function        | Purpose                              |
 * |-----------------|--------------------------------------|
 * | signup          | Creates new user + returns JWT token |
 * | login           | Authenticates user + returns JWT token|
 * | getProfile      | Returns logged-in user's data         |
 * | updateProfile   | Updates user's name/email/preferences |
 * | changePassword  | Updates user's password               |
 * | deleteAccount   | Deletes user + all related data       |
 * -------------------------------------------------
 * 
 * RELATED FILES:
 * - models/User.js (database operations)
 * - routes/auth.js (endpoint definitions)
 * - middleware/auth.js (authentication)
 */
import crypto from "crypto";
import User from "../../models/User.js";
import sendEmail from "../../Email/email.js";
import { template,resetPasswordTemplate } from "../../Email/emailTemplate.js";
// import { resetPasswordTemplate } from "../../Email/emailTemplate.js";
import {
  isValidEmail,
  isStrongPassword,
  isValidName,
  passwordsMatch
} from "../../utils/validators.js";
// import userValidationSchema from "../../utils/validators.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json("All fields are required");
    }

    if (!isValidName(name)) return res.status(400).json("Name too short");
    if (!isValidEmail(email)) return res.status(400).json("Invalid email");
    if (!isStrongPassword(password)) return res.status(400).json("Weak password");
    if (!passwordsMatch(password, confirmPassword))
      return res.status(400).json("Passwords do not match");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verifyToken: verificationToken,
       theme: "light"
    });
const verifyUrl = `http://localhost:5000/api/auth/verify/${verificationToken}`;
// const htmlContent = ` <h2>Verify Your Email</h2>
//  <p> Click the link below to verify your account: </p>
//   <a href="${verifyUrl}"> Verify Account </a> `;
await sendEmail({
  email: user.email,
  subject: "Verify Your Email ✔",
  html: template(verifyUrl),
});

    return res.status(201).json({
      message: "Check your email to verify your account",
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};
// Update User Theme
export const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;

    // Validate theme input
    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json({ message: "Invalid theme selection" });
    }

    // req.user.id comes from your auth middleware
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { theme }, 
      { new: true } // Returns the updated document
    );

    res.status(200).json({
      message: "Theme updated successfully",
      theme: updatedUser.theme
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//verifyEmail
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Find user by the verification token
    const user = await User.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).send(`
        <div style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: red;">Invalid or Expired Token</h1>
          <p>The verification link is invalid or has already been used.</p>
        </div>
      `);
    }

    // 2. Update user status
    user.isVerified = true;
    user.verifyToken = undefined; // Remove token so it can't be used again

    await user.save();

    // 3. Return success response with a link to your Frontend Login page
    return res.send(`
      <div style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: green;">✔ Email Verified Successfully</h1>
        <p>Your account is now active. You can proceed to login.</p>
        
        // <a href="http://localhost:5000/login" 
        //    style="
        //      display: inline-block;
        //      margin-top: 20px;
        //      padding: 12px 20px;
        //      background: #000;
        //      color: #fff;
        //      text-decoration: none;
        //      border-radius: 8px;
        //      font-weight: bold;
        //    ">
        //   Go to Login
        // </a>
      </div>
    `);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// LOGIN
export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json("User not found");
    }
if (!user.isVerified) {
      return res.status(401).json("Please verify your email first. Check your inbox!");
    }
    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json("Wrong password");
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
       theme: user.theme,
    };

    res.json({
      token,
      user: userWithoutPassword,
    });

  } catch (err) {

    res.status(500).json(err.message);

  }
};
// @desc    Forgot Password - Sending Reset Link
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json("There is no user with that email.");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
// const htmlContent =`
//       <h1>You requested a password reset</h1>
//       <p>Please click on the link below to reset your password. This link is valid for 15 minutes only:</p>
//       <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
//     `;
// const htmlContent = resetPasswordTemplate(resetUrl)
    try {
      console.log("🔥 FORGOT PASSWORD HIT");
console.log("RESET URL:", resetUrl);
   await sendEmail({
  email: user.email,
  subject: "Reset Your Password ✔",
  html:resetPasswordTemplate(resetUrl),
});

      res.status(200).json({ message: "Email sent successfully!" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json("Email could not be sent");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// @desc    Reset Password - Updating the password in DB
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json("Invalid or expired token");
    }

    const { password } = req.body;
    if (!isStrongPassword(password)) return res.status(400).json("Weak password");
    if (!password) return res.status(400).json("Please provide a new password");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully! You can login now." });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

//Update User

