/**
 * AUTHENTICATION ROUTES
 * =====================
 * 
 * PURPOSE:
 * This file defines all API endpoints for user authentication.
 * It maps URLs to controller functions.
 * 
 * ASSIGNED TO: AMANY
 * HOW TO USE:
 * - After creating controller functions, connect them here
 * - Each route calls a function from authController
 * 
 * EXAMPLE:
 * router.post('/signup', authController.signup);
 *               ↑              ↑
 *            URL path      controller function
 */ 
import express from "express";
import { register, login,verifyEmail,updateTheme,forgotPassword,resetPassword} from "./auth.controller.js";
import { verifyToken } from "../../middleware/auth.js";
const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/verify/:token", verifyEmail);
authRoutes.put("/update-theme", verifyToken, updateTheme);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.put("/reset-password/:token", resetPassword); 
export default authRoutes;