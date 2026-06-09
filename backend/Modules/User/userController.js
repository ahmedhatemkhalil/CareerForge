import User from "../../models/User.js";
import bcrypt from "bcrypt";
import { isStrongPassword } from "../../utils/validators.js";

// GET /api/users/me
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password_hash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me
export const updateCurrentUser = async (req, res) => {
  if (req.body.email) {
    return res.status(400).json({ message: "You can't update email" });
  }

  const { name, avatar_url } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar_url},
      { new: true, runValidators: true }
    ).select("-password_hash");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me/password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: "Weak password" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is wrong" });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/me
export const deleteCurrentUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Your account has been deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password_hash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/ban
export const banUser = async (req, res) => {
  try {
    const { status, ban_reason } = req.body;

    if (!["active", "suspended", "banned"].includes(status)) {
      return res.status(400).json({ message: "Status must be active, suspended, or banned" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ban_reason: status === "banned" ? ban_reason || null : null,
      },
      { new: true, runValidators: true }
    ).select("-password_hash");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User status updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/users/:id
export const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
