import User from "../../models/User.js";
import {
  isValidEmail,
  isStrongPassword,
  isValidName,
  passwordsMatch,
} from "../../utils/validators.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

const createRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
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
});

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!isValidName(name)) return res.status(400).json({ message: "Name too short" });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email" });
    if (!isStrongPassword(password)) return res.status(400).json({ message: "Weak password" });
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

    return res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.is_verified) {
      return res.status(401).json({ message: "Please verify your email first." });
    }
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended." });
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
  res.json({ message: "Logged out successfully" });
};

// POST /api/auth/refresh
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
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

    const accessToken = createAccessToken(user);

    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
