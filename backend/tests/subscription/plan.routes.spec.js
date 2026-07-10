import request from "supertest";
import app from "../../app.js";
import SubscriptionPlan from "../../models/SubscriptionPlan.js";
import { connectToTestDatabase, clearDatabase, closeDatabase } from "../../config/test-db.js";
import { createPlanTestData } from "./plan.helper.js";
import { mockNewPlanInput, mockUpdatePlanInput } from "./plan.mock.js";

describe("Subscription Plan Routes Integration Tests", () => {
    const testAgent = request(app);
    let adminToken, normalToken, existingPlan;

    beforeAll(async () => {
        await connectToTestDatabase();
    });

    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    async function setupData() {
        ({ adminToken, normalToken, existingPlan } = await createPlanTestData());
    }

    // ==========================================
    // 1. POST /api/plans (إنشاء خطة)
    // ==========================================
    it("(POST /api/plans) should allow admin to create a new plan", async () => {
        await setupData();
        const res = await testAgent
            .post("/api/plans")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(mockNewPlanInput); 

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(mockNewPlanInput.name);
        expect(res.body.data.limits.analysesPerMonth).toBe(mockNewPlanInput.limits.analysesPerMonth);
    });

    it("(POST /api/plans) should block non-admins from creating plans", async () => {
        await setupData();
        const res = await testAgent
            .post("/api/plans")
            .set("Authorization", `Bearer ${normalToken}`)
            .send({ name: "HackerPlan", limits: {} });

        expect([403, 401]).toContain(res.status); 
    });

    it("(POST /api/plans) should return 400 if plan already exists", async () => {
        await setupData();
        const res = await testAgent
            .post("/api/plans")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "Pro", limits: { analysesPerMonth: 30 } });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("already exists");
    });

    // ==========================================
    // 2. GET /api/plans (جلب كل الخطط المتاحة)
    // ==========================================
    it("(GET /api/plans) should allow any logged-in user to see all plans", async () => {
        await setupData();
        const res = await testAgent
            .get("/api/plans")
            .set("Authorization", `Bearer ${normalToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
    });

    // ==========================================
    // 3. PUT /api/plans/:name (تعديل الليميتس)
    // ==========================================
    it("(PUT /api/plans/:name) should allow admin to modify plan limits", async () => {
        await setupData();
        const res = await testAgent
            .put(`/api/plans/${existingPlan.name}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send(mockUpdatePlanInput);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.limits.analysesPerMonth).toBe(mockUpdatePlanInput.limits.analysesPerMonth);
    });
});