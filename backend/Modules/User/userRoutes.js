import express from "express";
import {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  deleteCurrentUser,
} from "./userController.js";
import {
  getUserSettings,
  updateUserSettings,
} from "../UserSettings/userSettings.controller.js";
import { verifyToken } from "../../middleware/auth.js";

const userRoutes = express.Router();

userRoutes.get("/me", verifyToken, getCurrentUser);
userRoutes.put("/me", verifyToken, updateCurrentUser);
userRoutes.put("/me/password", verifyToken, changePassword);
userRoutes.delete("/me", verifyToken, deleteCurrentUser);

userRoutes.get("/me/settings", verifyToken, getUserSettings);
userRoutes.put("/me/settings", verifyToken, updateUserSettings);

export default userRoutes;
