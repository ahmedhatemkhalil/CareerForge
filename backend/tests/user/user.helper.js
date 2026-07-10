import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/User.js";

export const DEFAULT_PASSWORD = "Password123!";
export const NEW_PASSWORD = "NewPassword1!";

export async function createUserAndToken({
  email = "user@test.com",
  name = "Test User",
  password = DEFAULT_PASSWORD,
  overrides = {},
} = {}) {
  const user = await User.create({
    name,
    email,
    password_hash: await bcrypt.hash(password, 10),
    is_verified: true,
    status: "active",
    ...overrides,
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { user, token };
}
