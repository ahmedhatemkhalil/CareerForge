export const mockCheckoutSession = {
    id: "cs_test_123",
    url: "https://stripe.com/test-checkout",
};

export const mockPortalSession = {
    url: "https://stripe.test/portal",
};

export const mockCustomer = {
    id: "cus_test_123",
};

export const mockRetrieveSession = {
    id: "cs_test_123",
    customer: "cus_test",
    subscription: "sub_test",
    payment_status: "paid",
    metadata: {
        userId: null,
    },
};

export const mockSubscriptionResponse = {
    plan: "pro",
    subscriptionStatus: "active",
    cancelAtPeriodEnd: false,
};

export const mockStats = {
    totalRevenue: 60,
    monthRevenue: 40,
    totalPayments: 3,
    activeSubscribers: 2,
};