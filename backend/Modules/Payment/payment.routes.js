import express from "express";
import { verifyToken, adminOnly } from "../../middleware/auth.js";
import {createCheckoutSession, confirmCheckoutSession, getSubscription, createPortalSession, getMyPayments, getAllPayments, getPaymentById, getPaymentStats} from "./payment.controller.js";
const router = express.Router();
router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.post("/confirm-checkout-session", verifyToken, confirmCheckoutSession);
router.get("/subscription", verifyToken, getSubscription);
router.post("/create-portal-session", verifyToken, createPortalSession);
router.get("/my-payments", verifyToken, getMyPayments);


router.get("/",verifyToken, adminOnly, getAllPayments);
router.get("/stats", verifyToken, adminOnly, getPaymentStats);
router.get("/:id", verifyToken, adminOnly, getPaymentById);
export default router;