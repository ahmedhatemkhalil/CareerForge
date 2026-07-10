import express from "express";
import { getAllUsers, banUser, deleteUserByAdmin ,  getAllAnalysesForAdmin, 
  getAllInterviewsForAdmin, 
  getAllRoadmapsForAdmin ,getAdminDashboardReport} from "./userController.js";


import { verifyToken, adminOnly } from "../../middleware/auth.js";

const adminRoutes = express.Router();

adminRoutes.use(verifyToken, adminOnly);

adminRoutes.get("/users", getAllUsers);
adminRoutes.put("/users/:id/ban", banUser);
adminRoutes.delete("/users/:id", deleteUserByAdmin);


// the part added recently for admin dashboard
adminRoutes.get("/analyses", getAllAnalysesForAdmin);
adminRoutes.get("/interviews", getAllInterviewsForAdmin);
adminRoutes.get("/roadmaps", getAllRoadmapsForAdmin);
adminRoutes.get("/dashboard-report", getAdminDashboardReport);


export default adminRoutes;