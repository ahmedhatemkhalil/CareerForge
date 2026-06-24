import express from "express";
import { verifyToken } from "../../middleware/auth.js";
import {createCheckoutSession, getSubscription} from "./payment.controller.js";
const router = express.Router();
router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.get("/subscription", verifyToken, getSubscription);

export default router;