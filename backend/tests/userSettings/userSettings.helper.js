import jwt from "jsonwebtoken";

import User from "../../models/User.js";

export async function createUserAndToken(email = "settings@test.com") {
  const user = await User.create({
    name: "Settings Test User",
    email,
    password_hash: "hashed-password",
    is_verified: true,
    status: "active",
  });

  const token = jwt.sign(
    { id: user._id, role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { user, token };
}
