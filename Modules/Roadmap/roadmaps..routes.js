

import express from "express";
import { createRoadmap, getAllRoadmaps, getRoadmapById, updateRoadmapProgress } from "./roadmap.controller.js";
import { verifyToken } from "../../middleware/auth.js";

const roadmapRoutes = express.Router();

roadmapRoutes.post("/", verifyToken, createRoadmap);
roadmapRoutes.get("/", verifyToken, getAllRoadmaps);
roadmapRoutes.get("/:id", verifyToken, getRoadmapById);
roadmapRoutes.patch("/:id/progress", verifyToken, updateRoadmapProgress);

export default roadmapRoutes;
