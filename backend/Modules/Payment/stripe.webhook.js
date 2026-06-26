import express from "express";
import User from "../../models/User.js";
import stripe from "../../services/stripe.service.js";
import Payment from "../../models/Payment.js";

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
                    user.plan = "free";
                    user.subscriptionStatus = "canceled";
                    user.subscriptionCurrentPeriodEnd = null;
                    user.cancelAtPeriodEnd = false;
                    user.stripeSubscriptionId = null;
                    await user.save();
                }

                break;
            }

            case "invoice.paid":
            case "invoice.payment_succeeded": {
                const invoice = event.data.object;
                const existingPayment = await Payment.findOne({stripeInvoiceId: invoice.id});

                if (existingPayment) {
                    break;
                }

                const user = await User.findOne({
                    stripeCustomerId: invoice.customer,
                });

                if (!user) {
                    break;
                }

                await Payment.create({
                    userId: user._id,
                    stripeCustomerId: invoice.customer,
                    stripePaymentIntentId:
                        invoice.payment_intent,
                    stripeInvoiceId: invoice.id,
                    amount:
                        (invoice.amount_paid || 0) / 100,
                    currency: invoice.currency,
                    status: "paid",
                    paymentMethod:
                        invoice.collection_method,
                });

                break;
            }
            default:  break;
        }

        res.json({received: true});
    }
);
export default router;