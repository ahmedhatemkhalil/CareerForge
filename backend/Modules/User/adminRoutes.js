import express from "express";
import { getAllUsers, banUser, deleteUserByAdmin } from "./userController.js";
import { verifyToken, adminOnly } from "../../middleware/auth.js";

const adminRoutes = express.Router();

// adminRoutes.use(verifyToken, adminOnly);

adminRoutes.get("/users", getAllUsers);
adminRoutes.put("/users/:id/ban", banUser);
adminRoutes.delete("/users/:id", deleteUserByAdmin);

export default adminRoutes;
