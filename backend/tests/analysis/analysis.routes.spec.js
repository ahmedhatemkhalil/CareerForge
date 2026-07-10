import request from "supertest";
import app from "../../app.js";
import { Analysis } from "../../models/Analysis.js";
import { connectToTestDatabase, clearDatabase, closeDatabase } from "../../config/test-db.js";
import { createAnalysisTestData } from "./analysis.helper.js";
import { mockAiAnalysisResponse } from "./analysis.mock.js";
// import * as analysisService from "../../services/geminiService.js";



describe("Analysis Routes Integration Tests", () => {
    const testAgent = request(app);
    let token, user, cv, job, analysis;

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
        ({ user, token, cv, job, analysis } = await createAnalysisTestData());
    }

    // ================= 1. TEST POST / (Create Analysis) =================
    it("(POST /api/analysis) should create a new analysis successfully", async () => {
        await setupData();

      
        //  spyOn(analysisService, "processAIAnalysisSync").and.resolveTo(mockAiAnalysisResponse);

        const res = await testAgent
            .post("/api/analysis")
            .set("Authorization", `Bearer ${token}`)
            .send({
                cvId: cv._id.toString(),
                jobId: job._id.toString()
            });

        expect([200, 201]).toContain(res.status);
        
        const savedAnalysis = await Analysis.findOne({ userId: user._id, cvId: cv._id });
        expect(savedAnalysis).not.toBeNull();
    });

    it("(POST /api/analysis) should return 400 if validation fails (missing fields)", async () => {
        await setupData();

        const res = await testAgent
            .post("/api/analysis")
            .set("Authorization", `Bearer ${token}`)
            .send({
                cvId: cv._id.toString() 
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBeDefined(); 
    });

    // ================= 2. TEST GET ALL =================
    it("(GET /api/analysis) should return all analyses for user", async () => {
        await setupData();
        const res = await testAgent
            .get("/api/analysis")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        const data = Array.isArray(res.body) ? res.body : res.body.data;
        expect(data.length).toBe(1);
    });

    // ================= 3. TEST GET BY ID =================
    it("(GET /api/analysis/:id) should return single analysis details", async () => {
        await setupData();
        const res = await testAgent
            .get(`/api/analysis/${analysis._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
    });

    // ================= 4. TEST DELETE =================
    it("(DELETE /api/analysis/:id) should delete analysis successfully", async () => {
        await setupData();
        const res = await testAgent
            .delete(`/api/analysis/${analysis._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);

        const checkDeleted = await Analysis.findById(analysis._id);
        expect(checkDeleted).toBeNull();
    });
});