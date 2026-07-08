import request from "supertest";
import app from "../../app.js";
import Payment from "../../models/Payment.js";
import User from "../../models/User.js";
import stripe from "../../services/stripe.service.js";
import {connectToTestDatabase, clearDatabase, closeDatabase} from "../../config/test-db.js";
import {createUserAndToken, createAdminAndToken, createPayment} from "./payment.helper.js";
import {mockPortalSession, mockRetrieveSession} from "./payment.mock.js";
const originalRetrieve = stripe.checkout.sessions.retrieve;
const originalPortalCreate = stripe.billingPortal.sessions.create;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
describe("Payment Routes", () => {
    const testAgent = request(app);
    let user;
    let token;
    let admin;
    let adminToken;

    beforeAll(async () => {
        await connectToTestDatabase();
    });

    afterEach(async () => {
        jasmine.getEnv().allowRespy(true);
        stripe.checkout.sessions.retrieve = originalRetrieve;
        stripe.billingPortal.sessions.create = originalPortalCreate;
        await clearDatabase();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    async function setupUser() {
        ({ user, token } = await createUserAndToken());
    }

    async function setupAdmin() {
        ({ user: admin, token: adminToken } = await createAdminAndToken());
    } 

    async function setupTestData() {
        ({ user, token } = await createUserAndToken());
    }

    it("(GET /my-payments) without token should return 401", async () => {
        const res = await testAgent.get("/api/payments/my-payments");
        expect(res.status).toBe(401);
    });

    it("(GET /my-payments) should return []", async () => {
        await setupUser();

        const res = await testAgent
            .get("/api/payments/my-payments")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("(GET /my-payments) should return user payments", async () => {
        await setupUser();
        await createPayment(user);

        const res = await testAgent
            .get("/api/payments/my-payments")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].amount).toBe(20);
    });

    it("(GET /payments) user should return 403", async () => {
        await setupUser();

        const res = await testAgent
            .get("/api/payments")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    it("(GET /payments) admin should return all payments", async () => {
        await setupAdmin();

        const { user: u1 } = await createUserAndToken();
        const { user: u2 } = await createUserAndToken();

        await createPayment(u1);
        await createPayment(u2);

        const res = await testAgent
            .get("/api/payments")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it("(GET /payments/:id) invalid id should return 500", async () => {
        await setupAdmin();

        const res = await testAgent
            .get("/api/payments/123")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
    });

    it("(GET /payments/:id) payment not found", async () => {
        await setupAdmin();

        const fakeId = "686000000000000000000010";

        const res = await testAgent
            .get(`/api/payments/${fakeId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/payment not found/i);
    });

    it("(GET /payments/:id) should return payment", async () => {
        await setupAdmin();
        const { user } = await createUserAndToken();
        const payment = await createPayment(user);
        const res = await testAgent
            .get(`/api/payments/${payment._id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.amount).toBe(20);
        expect(res.body.userId.email).toBe(user.email);
    });

    it("(GET /stats) should return payment statistics", async () => {
        await setupAdmin();
        const { user } = await createUserAndToken();
        await createPayment(user, { amount: 25 });
        await createPayment(user, { amount: 35 });
        await User.findByIdAndUpdate(user._id, {
            plan: "pro",
            subscriptionStatus: "active",
        });

        const res = await testAgent
            .get("/api/payments/stats")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);

        expect(res.body.totalRevenue).toBe(60);
        expect(res.body.monthRevenue).toBe(60);
        expect(res.body.totalPayments).toBe(2);
        expect(res.body.activeSubscribers).toBe(1);
    }); 

    it("(POST /api/payments/confirm-checkout-session) should confirm payment", async () => {
        await setupTestData();

        user.stripeCustomerId = "cus_test";
        await user.save();

        stripe.checkout.sessions.retrieve = async () => ({
            ...mockRetrieveSession,
            metadata: {
                userId: String(user._id),
            },
            client_reference_id: String(user._id),
            customer: "cus_test",
            subscription: "sub_test",
        });

        spyOn(stripe.subscriptions, "retrieve").and.resolveTo({
            id: "sub_test",
            status: "active",
            cancel_at_period_end: false,
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
        });

        const res = await testAgent
            .post("/api/payments/confirm-checkout-session")
            .set("Authorization", `Bearer ${token}`)
            .send({
                session_id: "cs_test",
            });

        expect(res.status).toBe(200);
        expect(res.body.plan).toBe("pro");
        expect(res.body.status).toBe("active");

        const updatedUser = await User.findById(user._id);

        expect(updatedUser.plan).toBe("pro");
        expect(updatedUser.subscriptionStatus).toBe("active");
        expect(updatedUser.stripeSubscriptionId).toBe("sub_test");

        stripe.checkout.sessions.retrieve = originalRetrieve;
    });

    it("(GET /api/payments/subscription) should return subscription", async () => {
        await setupTestData();
        user.plan = "pro";
        user.subscriptionStatus = "active";
        await user.save();

        spyOn(stripe.billingPortal.sessions, "create").and.resolveTo(mockPortalSession);

        spyOn(stripe.subscriptions, "retrieve").and.resolveTo({
            id: "sub_test",
            status: "active",
            cancel_at_period_end: false,
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
        });

        const res = await testAgent
            .get("/api/payments/subscription")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.plan).toBe("pro");
        expect(res.body.status).toBe("active");
    });

    it("(POST /api/payments/create-portal-session) should create portal session", async () => {
        await setupTestData();

        user.stripeCustomerId = "cus_test";
        await user.save();

        spyOn(stripe.subscriptions, "retrieve").and.resolveTo({
            id: "sub_test",
            status: "active",
            cancel_at_period_end: false,
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
        });

        spyOn(stripe.billingPortal.sessions, "create").and.resolveTo(mockPortalSession);

        const res = await testAgent
            .post("/api/payments/create-portal-session")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.url).toContain("stripe.test");
    });

    it("(GET /api/payments/my-payments) should return user payments", async () => {
        await setupTestData();

        await createPayment(user, {
            stripeInvoiceId: "inv_1",
        });

        const res = await testAgent
            .get("/api/payments/my-payments")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].amount).toBe(20);
    });

    it("(GET /api/payments) should return all payments", async () => {
        await setupAdmin();

        await createPayment(admin, {
            stripeInvoiceId: "inv_1",
        });

        const res = await testAgent
            .get("/api/payments")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
    });

    it("(GET /api/payments/:id) should return payment details", async () => {
        await setupAdmin();

        const payment = await createPayment(admin, {
            amount: 15,
            stripeInvoiceId: "inv_1",
        });

        const res = await testAgent
            .get(`/api/payments/${payment._id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.amount).toBe(15);
    });

    it("(GET /api/payments/stats) should return payment statistics", async () => {
        await setupAdmin();
        admin.plan = "pro";
        admin.subscriptionStatus = "active";
        await admin.save();

        await createPayment(admin, {
            amount: 25,
            stripeInvoiceId: "inv_1",
        });

        const res = await testAgent
            .get("/api/payments/stats")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.totalRevenue).toBe(25);
        expect(res.body.totalPayments).toBe(1);
        expect(res.body.activeSubscribers).toBe(1);
    });
}); 