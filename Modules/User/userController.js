

import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";






//Get Users
export const getUsers = async (req, res) => {
  try {
  const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json(err.message);
  }
};



export const getCurrentUser = async (req, res) => {

  try {

    const user = await User.findById(req.user.id)
      .select("-password");

      if (!user) {
        return res.status(404).json("User not found");
    }
    res.json(user);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const updateCurrentUser = async (req, res) => {
   if (req.body.email){
        return res.status(404).json({massage:"you can't update email"});
      }
//  const { name, email } = req.body;
  try {

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updatedUser);

  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // check current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json("Current password is wrong");
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.json("Password updated successfully");

  } catch (err) {
    res.status(500).json(err.message);
  }
};
// DELETE CURRENT USER
export const deleteCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; //token

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json("User not found");
    }

    res.json("Your account has been deleted successfully");

  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const updateTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json("Invalid theme");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { theme },
      { new: true }
    ).select("-password");

    res.json({
      message: "Theme updated successfully",
      theme: user.theme,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
};