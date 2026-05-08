/**
 * ROADMAP ROUTES
 * ==============
 * 
 * PURPOSE:
 * This file defines all API endpoints for career roadmaps.
 * It maps URLs to controller functions.
 * 
 * ASSIGNED TO: Ahmed
 * 

 * UNIQUE FEATURE:
 * - ignoreSkills field tells users what NOT to learn
 * - Progress auto-calculates when weeks are marked complete
 * 
 * NOTES:
 * - All routes require authentication (auth middleware)
 * - The {id} in URL is a placeholder (replace with actual roadmap ID)
 * - The {weekNum} in URL is a number (1, 2, 3, etc.)
 */
import express from "express";
import { createRoadmap, getAllRoadmaps, getRoadmapById } from "./roadmap.controller.js";
import { verifyToken } from "../../middleware/auth.js";

const roadmapRoutes = express.Router();

roadmapRoutes.post("/", verifyToken, createRoadmap);
roadmapRoutes.get("/", verifyToken, getAllRoadmaps);
roadmapRoutes.get("/:id", verifyToken, getRoadmapById);

export default roadmapRoutes;
