import express from "express";
import User from "../../models/User.js";
import stripe from "../../services/stripe.service.js";
import { applyDowngradeToFree, applyProSubscription } from "../../services/subscription.service.js";
import {
    recordPaymentFromCheckoutSession,
    recordPaymentFromInvoice,
} from "../../services/payment.service.js";

const router = express.Router();

router.post("/", express.raw({type: "application/json",}),
    async (req, res) => {
        let event;

        try {
            const signature = req.headers["stripe-signature"];
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
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

                let user = await User.findOne({ stripeCustomerId: customerId });

                if (!user && session.metadata?.userId) {
                    user = await User.findById(session.metadata.userId);
                }

                if (!user && session.client_reference_id) {
                    user = await User.findById(session.client_reference_id);
                }

                if (user) {
                    await applyProSubscription(user, { customerId, subscriptionId });
                    await recordPaymentFromCheckoutSession(user, session);
                }

                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const user = await User.findOne({stripeSubscriptionId: subscription.id});

                if (user) {
                    user.subscriptionStatus = subscription.status;
                    const willCancel = subscription.cancel_at_period_end || (subscription.cancel_at && subscription.status === "active");
                    user.cancelAtPeriodEnd = !!willCancel;
                    await user.save();
                }

                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const user = await User.findOne({stripeSubscriptionId: subscription.id});

                if (user) {
                    await applyDowngradeToFree(user);
                }

                break;
            }

            case "invoice.paid":
            case "invoice.payment_succeeded": {
                const invoice = event.data.object;
                const user = await User.findOne({
                    stripeCustomerId: invoice.customer,
                });

                if (!user) {
                    break;
                }

                await recordPaymentFromInvoice(invoice, user);

                break;
            }
            default:  break;
        }

        res.json({received: true});
    }
);
export default router;