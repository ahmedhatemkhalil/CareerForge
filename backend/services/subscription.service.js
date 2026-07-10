import stripe from "./stripe.service.js";

export const subscriptionResponse = (user) => ({
    plan: user.plan,
    status: user.subscriptionStatus,
    currentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd,
});

export const applyDowngradeToFree = async (user) => {
    user.plan = "free";
    user.subscriptionStatus = "canceled";
    user.subscriptionCurrentPeriodEnd = null;
    user.cancelAtPeriodEnd = false;
    user.stripeSubscriptionId = null;
    await user.save();
    return user;
};

export const applyProSubscription = async (user, { customerId, subscriptionId }) => {
    if (customerId && !user.stripeCustomerId) {
        user.stripeCustomerId = customerId;
    }

    user.plan = "pro";
    user.subscriptionStatus = "active";
    user.stripeSubscriptionId = subscriptionId || user.stripeSubscriptionId;
    user.cancelAtPeriodEnd = false;

    if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        user.subscriptionStatus = subscription.status;
        user.cancelAtPeriodEnd = subscription.cancel_at_period_end ?? false;

        if (subscription.current_period_end) {
            user.subscriptionCurrentPeriodEnd = new Date(
                subscription.current_period_end * 1000
            );
        }
    }

    await user.save();
    return user;
};

export const syncUserSubscription = async (user) => {
    const now = new Date();
    const periodEnded =
        user.subscriptionCurrentPeriodEnd &&
        new Date(user.subscriptionCurrentPeriodEnd) <= now;

    if (user.plan === "pro" && periodEnded) {
        return applyDowngradeToFree(user);
    }

    if (!user.stripeSubscriptionId && user.stripeCustomerId) {
        try {
            const { data: subscriptions } = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: "active",
                limit: 1,
            });

            if (subscriptions[0]) {
                return applyProSubscription(user, {
                    customerId: user.stripeCustomerId,
                    subscriptionId: subscriptions[0].id,
                });
            }
        } catch (error) {
            console.error("Stripe subscription lookup failed:", error.message);
        }
    }

    if (!user.stripeSubscriptionId) {
        return user;
    }

    try {
        const subscription = await stripe.subscriptions.retrieve(
            user.stripeSubscriptionId
        );

        const isInactive = ["canceled", "unpaid", "incomplete_expired"].includes(
            subscription.status
        );

        if (isInactive) {
            return applyDowngradeToFree(user);
        }

        user.plan = "pro";
        user.subscriptionStatus = subscription.status;
        user.cancelAtPeriodEnd = subscription.cancel_at_period_end ?? false;

        if (subscription.current_period_end) {
            user.subscriptionCurrentPeriodEnd = new Date(
                subscription.current_period_end * 1000
            );
        }

        if (
            user.cancelAtPeriodEnd &&
            user.subscriptionCurrentPeriodEnd &&
            new Date(user.subscriptionCurrentPeriodEnd) <= now
        ) {
            return applyDowngradeToFree(user);
        }

        await user.save();
    } catch (error) {
        if (error?.statusCode === 404 || error?.code === "resource_missing") {
            return applyDowngradeToFree(user);
        }
    }

    return user;
};
