import express from "express";

import {
  getCurrentUser,
  updateCurrentUser,
  getUsers,
  deleteCurrentUser,
   changePassword,
  //  updateTheme
} from "./userController.js";

import { verifyToken } from "../../middleware/auth.js";

const userRoutes = express.Router();

userRoutes.get("/profile", verifyToken, getCurrentUser);

userRoutes.put("/profile", verifyToken, updateCurrentUser);
userRoutes.delete("/profile", verifyToken, deleteCurrentUser);
userRoutes.put("/pasword", verifyToken, changePassword);
userRoutes.get("/", getUsers);
// userRoutes.put("/theme", updateTheme);

export default userRoutes;