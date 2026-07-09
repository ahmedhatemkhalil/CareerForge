import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/User.js";
import Session from "../../models/Session.js";
import EmailVerification from "../../models/EmailVerification.js";

export const DEFAULT_PASSWORD = "Password123!";
export const VALID_SIGNUP = {
  name: "Auth User",
  email: "authuser@test.com",
  password: DEFAULT_PASSWORD,
  confirmPassword: DEFAULT_PASSWORD,
};

export async function createVerifiedUser(overrides = {}) {
  const random = Date.now() + Math.floor(Math.random() * 10000);

  return User.create({
    name: "Test User",
    email: `user${random}@test.com`,
    password_hash: await bcrypt.hash(DEFAULT_PASSWORD, 10),
    is_verified: true,
    status: "active",
    ...overrides,
  });
}

export async function createAdminUser(overrides = {}) {
  const random = Date.now() + Math.floor(Math.random() * 10000);

  return User.create({
    name: "Admin User",
    email: `admin${random}@test.com`,
    password_hash: await bcrypt.hash(DEFAULT_PASSWORD, 10),
    is_verified: true,
    status: "active",
    role: "admin",
    ...overrides,
  });
}

export async function createVerificationRecord(userId, token = "valid-verification-token") {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  return EmailVerification.create({
    user_id: userId,
    token,
    is_used: false,
    expires_at: expiresAt,
  });
}

export function createRefreshToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, type: "refresh" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export async function createSessionForUser(user, refreshToken = null) {
  const token = refreshToken || createRefreshToken(user);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const session = await Session.create({
    user_id: user._id,
    refresh_token: token,
    expires_at: expiresAt,
  });

  return { session, refreshToken: token };
}