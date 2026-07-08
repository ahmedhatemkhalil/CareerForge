import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import Payment from "../../models/Payment.js";

export const CUSTOMER_ID = "cus_test_123";
export const SUBSCRIPTION_ID = "sub_test_123";
export const PAYMENT_INTENT_ID = "pi_test_123";
export const INVOICE_ID = "in_test_123";

export async function createUserAndToken(role = "user") {
    const random = Date.now() + Math.floor(Math.random() * 10000);

    const user = await User.create({
        name: role === "admin" ? "Admin User" : "Test User",
        email: role === "admin"
                ? `admin${random}@test.com`
                : `test${random}@test.com`,
        password_hash: "123456",
        role,
        stripeCustomerId: CUSTOMER_ID,
        usage: {
            analysesThisMonth: 0,
            interviewsThisMonth: 0,
            roadmapsThisMonth: 0,
        },
    });

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );

    return {
        user,
        token,
    };
}

    export async function createAdminAndToken() {
        return createUserAndToken("admin");
    }

export async function createPayment(user, overrides = {}) {
    return Payment.create({
        userId: user._id,
        stripeCustomerId: CUSTOMER_ID,
        stripePaymentIntentId: PAYMENT_INTENT_ID,
        stripeInvoiceId: overrides.stripeInvoiceId || `inv_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        amount: 20,
        currency: "usd",
        status: "paid",
        paymentMethod: "charge_automatically",
        ...overrides,
    });
}