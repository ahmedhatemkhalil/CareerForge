import User from "../../models/User.js";
import stripe from "../../services/stripe.service.js";

export const createCheckoutSession = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message,});
    }
    };

    export const getSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            plan: user.plan,
            status: user.subscriptionStatus,
            currentPeriodEnd: user.subscriptionCurrentPeriodEnd,
        });
    } catch (error) {
        res.status(500).json({message: error.message,});
    }
};