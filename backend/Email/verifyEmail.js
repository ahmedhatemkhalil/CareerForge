// GET /api/auth/verify/:token
export const verifyEmail = async (req, res) => {
  const user = await User.findOne({ verifyToken: req.params.token });
  if (!user) return res.status(400).json("Invalid or expired token");

  user.isVerified = true;
  user.verifyToken = undefined; // Remove token once used
  await user.save();
  res.status(200).send("Email verified! You can now log in.");
};
