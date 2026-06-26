import User from "../../models/User.js";
import stripe from "../../services/stripe.service.js";
import Payment from "../../models/Payment.js";
import { handleError } from "../../middleware/HandleError.js";

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
        line_items: [
            {
                price:
                process.env.STRIPE_PRICE_PRO,
                quantity: 1,
            },
        ],

        success_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    res.json({url: session.url,});
});

export const getSubscription = handleError(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({message: "User not found"});
    }
    res.json({
        plan: user.plan,
        status: user.subscriptionStatus,
        currentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    });
});

export const createPortalSession = handleError(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No Stripe customer found",});
    }

    const session = await stripe.billingPortal.sessions.create(
        {
            customer: user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_URL}/billing`,
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

export const getMyPayments = handleError(async (req, res) => {
    const payments = await Payment.find({userId: req.user.id}).sort({ createdAt: -1 });
    res.json(payments);
});