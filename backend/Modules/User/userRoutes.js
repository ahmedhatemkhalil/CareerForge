import express from "express";
import {
  getCurrentUser,
  updateCurrentUser,
  uploadUserAvatar,
  changePassword,
  deleteCurrentUser,
} from "./userController.js";
import { avatarUpload } from "../../config/avatarMulter.js";
import {
  getUserSettings,
  updateUserSettings,
} from "../UserSettings/userSettings.controller.js";
import { verifyToken } from "../../middleware/auth.js";

const userRoutes = express.Router();

userRoutes.get("/me", verifyToken, getCurrentUser);
userRoutes.post(
  "/me/avatar",
  verifyToken,
  avatarUpload.single("avatar"),
  uploadUserAvatar
);
userRoutes.put("/me", verifyToken, updateCurrentUser);
userRoutes.put("/me/password", verifyToken, changePassword);
userRoutes.delete("/me", verifyToken, deleteCurrentUser);

userRoutes.get("/me/settings", verifyToken, getUserSettings);
userRoutes.put("/me/settings", verifyToken, updateUserSettings);

export default userRoutes;
