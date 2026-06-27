import express from "express";
import { signup, login, adminLogin, logout, refresh, getSessions, deleteSession, resendVerification } from "./auth.controller.js";
import { verifyToken } from "../../middleware/auth.js";
import { verifyEmail } from "../../Email/verifyEmail.js";
const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/admin/login", adminLogin);
authRoutes.post("/logout", verifyToken, logout);
authRoutes.post("/refresh", refresh);

//session
authRoutes.get("/sessions", verifyToken, getSessions);
authRoutes.delete("/sessions/:sessionId", verifyToken, deleteSession);

// Email verification 
authRoutes.post("/resend-verification", resendVerification);
authRoutes.get("/verify-email/:token", verifyEmail);
export default authRoutes;
