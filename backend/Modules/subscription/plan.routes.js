import express from "express";
import { verifyToken, adminOnly } from "../../middleware/auth.js"; 
import { createPlan, getAllPlans, updatePlanLimits  } from "../subscription/plan.controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", adminOnly, createPlan);          
router.get("/", getAllPlans);          
router.put("/:name", adminOnly, updatePlanLimits); 

export default router;