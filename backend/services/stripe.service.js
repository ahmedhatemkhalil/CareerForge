import Stripe from "stripe";

let stripeClient = null;

function getStripe() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    if (!stripeClient) {
        stripeClient = new Stripe(apiKey);
    }
    return stripeClient;
}

export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

export default new Proxy(
    {},
    {
        get(_target, prop) {
            const client = getStripe();
            const value = client[prop];
            if (typeof value === "function") {
                return value.bind(client);
            }
            return value;
        },
    }
);
