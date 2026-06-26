import crypto from "crypto";
import User from "../../models/User.js";
import UserSettings from "../../models/UserSettings.js";
import {
  isValidEmail,
  isStrongPassword,
  isValidName,
  passwordsMatch,
} from "../../utils/validators.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../../Email/email.js";
import { template } from "../../Email/emailTemplate.js";
import EmailVerification from "../../models/EmailVerification.js";
import Session from "../../models/Session.js";

const createAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

const createRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" },
  );

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar_url: user.avatar_url,
  role: user.role,
  status: user.status,
  is_verified: user.is_verified,
  last_login_at: user.last_login_at,
  created_at: user.created_at,
  updated_at: user.updated_at,
  subscriptionStatus: user.subscriptionStatus,
  subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
  cancelAtPeriodEnd: user.cancelAtPeriodEnd,
  usage: user.usage,
  plan: user.plan,
  stripeCustomerId: user.stripeCustomerId,
  stripeSubscriptionId: user.stripeSubscriptionId,
});

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!isValidName(name))
      return res.status(400).json({ message: "Name too short" });
    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email" });
    if (!isStrongPassword(password))
      return res.status(400).json({ message: "Weak password" });
    if (!passwordsMatch(password, confirmPassword)) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      is_verified: false,
    });

    //verification email
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await EmailVerification.create({
      user_id: user._id,
      token: verificationToken,
      is_used: false,
      expires_at: expiresAt,
    });

    const verifyUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;

    sendEmail({
      email: user.email,
      subject: "Verify Your Email - CareerForge",
      html: template(verifyUrl),
    }).catch((err) => console.error("Email send failed:", err));
    await UserSettings.create({ user_id: user._id });

    return res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      userId: user._id,
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
      { new: true }, // Returns the updated document
    );

    res.status(200).json({
      message: "Theme updated successfully",
      theme: updatedUser.theme,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.is_verified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first." });
    }
    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ message: "Your account has been suspended." });
    }
    if (user.status === "banned") {
      return res.status(403).json({
        message: user.ban_reason
          ? `Your account has been banned: ${user.ban_reason}`
          : "Your account has been banned.",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    user.last_login_at = new Date();
    await user.save();

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    //refresh token in Session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Session.create({
      user_id: user._id,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    });

    res.json({
      accessToken,
      refreshToken,
      user: toPublicUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const session = await Session.findOne({ refresh_token: refreshToken });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this session" });
    }

    await Session.deleteOne({ _id: session._id });
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const existingSession = await Session.findOne({
      refresh_token: refreshToken,
      expires_at: { $gt: new Date() },
    });

    if (!existingSession) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.status === "banned" || user.status === "suspended") {
      return res.status(403).json({ message: "Account is not active" });
    }
    await Session.deleteOne({ refresh_token: refreshToken });

    const accessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Session.create({
      user_id: user._id,
      refresh_token: newRefreshToken,
      expires_at: expiresAt,
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

//Update User

// GET /api/auth/sessions
export const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Session.find({
      user_id: userId,
      expires_at: { $gt: new Date() },
    }).select("-refresh_token");

    res.json({
      sessions: sessions.map((session) => ({
        id: session._id,
        created_at: session.created_at,
        expires_at: session.expires_at,
      })),
      total: sessions.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/auth/sessions/:sessionId
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { refreshToken } = req.body;

    const session = await Session.findOne({
      _id: sessionId,
      user_id: userId,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.refresh_token === refreshToken) {
      return res.status(403).json({
        message: "Cannot delete current session. Use logout instead",
      });
    }

    await Session.deleteOne({ _id: sessionId });

    res.json({ message: "Session terminated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    await EmailVerification.updateMany(
      { user_id: user._id, is_used: false },
      { is_used: true },
    );

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await EmailVerification.create({
      user_id: user._id,
      token: verificationToken,
      is_used: false,
      expires_at: expiresAt,
    });

    const verifyUrl = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - CareerForge",
      html: template(verifyUrl),
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
