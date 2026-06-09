import express from "express";
import { signup, login, logout, refresh } from "./auth.controller.js";
import { verifyToken } from "../../middleware/auth.js";

const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", verifyToken, logout);
authRoutes.post("/refresh", refresh);

export default authRoutes;
