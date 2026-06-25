import express from "express";
import User from "../../models/User.js";
import stripe from "../../services/stripe.service.js";

const router = express.Router();

router.post("/", express.raw({type: "application/json",}),
    async (req, res) => {
        let event;

        try {
            const signature = req.headers["stripe-signature"];
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env
                .STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const customerId = session.customer;
                const subscriptionId = session.subscription;
                const user = await User.findOne({stripeCustomerId: customerId,});
                if (user) {
                    user.plan = "pro";
                    user.subscriptionStatus = "active";
                    user.stripeSubscriptionId = subscriptionId;
                    const oneMonthFromNow = new Date();
                    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
                    user.subscriptionCurrentPeriodEnd = oneMonthFromNow;
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
                    user.subscriptionCurrentPeriodEnd = null;
                    await user.save();
                }

                break;
            }
            default: console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({received: true});
    }
);

export default router;