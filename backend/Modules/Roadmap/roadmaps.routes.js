import express from "express";
import { createRoadmap, getAllRoadmaps, getRoadmapById, updateRoadmapProgress, markWeekCompleted, unmarkWeekCompleted, deleteRoadmap, deleteAllRoadmaps } from "./roadmap.controller.js";
import { verifyToken } from "../../middleware/auth.js";
import { checkSubscription } from "../../middleware/checkSubscription.js"; 

const roadmapRoutes = express.Router();

roadmapRoutes.post("/", verifyToken, checkSubscription("roadmap"), createRoadmap);
roadmapRoutes.get("/", verifyToken, getAllRoadmaps);
roadmapRoutes.get("/:id", verifyToken, getRoadmapById);
roadmapRoutes.patch("/:id/progress", verifyToken, updateRoadmapProgress);
roadmapRoutes.patch("/:id/week/:weekNum/complete", verifyToken, markWeekCompleted);
roadmapRoutes.patch("/:id/week/:weekNum/uncomplete", verifyToken, unmarkWeekCompleted);
roadmapRoutes.delete("/:id", verifyToken, deleteRoadmap);
roadmapRoutes.delete("/", verifyToken, deleteAllRoadmaps);

export default roadmapRoutes;
