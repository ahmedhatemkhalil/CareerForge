import express from "express";
import Stripe from "stripe";
import User from "../../models/User.js";

const router = express.Router();
const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY
);

router.post("/", express.raw({type: "application/json",}),
    async (req, res) => {
        console.log("WEBHOOK HIT");
        let event;

        try {
            const signature = req.headers["stripe-signature"];
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env
                .STRIPE_WEBHOOK_SECRET
            );
            console.log("EVENT:", event.type);
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const customerId = session.customer;
                const subscriptionId = session.subscription;
                console.log("Customer:", customerId);
                console.log("Subscription:", subscriptionId);
                const user = await User.findOne({stripeCustomerId: customerId,});
                console.log("User Found:", user?._id);
                if (user) {
                    user.plan = "pro";
                    user.subscriptionStatus = "active";
                    user.stripeSubscriptionId = subscriptionId;
                    await user.save();
                }

                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const user = await User.findOne({stripeSubscriptionId: subscription.id});

                if (user) {
                    user.plan = "free";
                    user.subscriptionStatus = "canceled";
                    await user.save();
                }

                break;
            }
        }

        res.json({received: true});
    }
);

export default router;