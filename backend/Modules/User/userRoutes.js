import express from "express";
import {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  deleteCurrentUser,
} from "./userController.js";
import { verifyToken } from "../../middleware/auth.js";

const userRoutes = express.Router();

userRoutes.get("/me", verifyToken, getCurrentUser);
userRoutes.put("/me", verifyToken, updateCurrentUser);
userRoutes.put("/me/password", verifyToken, changePassword);
userRoutes.delete("/me", verifyToken, deleteCurrentUser);

export default userRoutes;
