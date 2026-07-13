import User from "../../models/User.js";
import stripe from "../../services/stripe.service.js";
import Payment from "../../models/Payment.js";
import { handleError } from "../../middleware/HandleError.js";
import {
    applyProSubscription,
    subscriptionResponse,
    syncUserSubscription,
} from "../../services/subscription.service.js";

const getFrontendUrl = () =>
    (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

export const createCheckoutSession = handleError(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({message: "User not found",});
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
        const customer = await stripe.customers.create({email: user.email, name: user.name,});
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await user.save();
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        mode: "subscription",
        client_reference_id: String(user._id),
        metadata: {
            userId: String(user._id),
        },
        line_items: [
            {
                price:
                process.env.STRIPE_PRICE_PRO,
                quantity: 1,
            },
        ],

        success_url: `${getFrontendUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getFrontendUrl()}/pricing`,
    });

    res.json({url: session.url,});
});

export const confirmCheckoutSession = handleError(async (req, res) => {
    const sessionId = req.body.session_id;

    if (!sessionId) {
        return res.status(400).json({ message: "session_id is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionUserId = session.metadata?.userId || session.client_reference_id;

    if (sessionUserId !== String(user._id)) {
        return res.status(403).json({ message: "This payment session does not belong to you" });
    }

    if (session.payment_status !== "paid") {
        return res.status(400).json({ message: "Payment is not completed yet" });
    }

    await applyProSubscription(user, {
        customerId: session.customer,
        subscriptionId: session.subscription,
    });

    res.json(subscriptionResponse(user));
});

export const getSubscription = handleError(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({message: "User not found"});
    }

    await syncUserSubscription(user);
    res.json(subscriptionResponse(user));
});

export const createPortalSession = handleError(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No Stripe customer found",});
    }

    await syncUserSubscription(user);

    const session = await stripe.billingPortal.sessions.create(
        {
            customer: user.stripeCustomerId,
            return_url: `${getFrontendUrl()}/pricing`,
        }
    );

    res.json({url: session.url,});
});

export const getAllPayments = handleError(async (req, res) => {
        const payments = await Payment.find().populate("userId", "name email").sort({ createdAt: -1 });
        res.json(payments);
});

export const getPaymentById = handleError(async (req, res) => {
    const payment = await Payment.findById(req.params.id).populate("userId", "name email");
    if (!payment) {
        return res.status(404).json({message: "Payment not found"});
    }
    res.json(payment);
});

export const getPaymentStats = handleError(async (req, res) => {
    const payments = await Payment.find({status: "paid"});
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const now = new Date();
    const activeProUsersCount = await User.countDocuments({
        plan: "pro",
        subscriptionStatus: "active"
    });

    const monthRevenue = payments.filter((payment) => {
        const date = new Date(payment.createdAt);
            return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        })
        .reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
        totalRevenue:Number(totalRevenue.toFixed(2)),
        monthRevenue:Number(monthRevenue.toFixed(2)),
        totalPayments: payments.length,
        activeSubscribers: activeProUsersCount || 0
    });
});

export const getMyPayments = handleError(async (req, res) => {
    const payments = await Payment.find({userId: req.user.id}).sort({ createdAt: -1 });
    res.json(payments);
});