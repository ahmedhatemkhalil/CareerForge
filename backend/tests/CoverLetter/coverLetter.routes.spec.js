import request from "supertest";
import app from "../../app.js";
import CoverLetter from "../../models/CoverLetter.js";
import { connectToTestDatabase, clearDatabase, closeDatabase } from "../../config/test-db.js";
import { createCoverLetterTestData } from "./coverLetter.helper.js";
import { mockCoverLetterInput, mockCreativeTemplateExpectation, mockTechnicalTemplateExpectation } from "./coverLetter.mock.js";

describe("Cover Letter Routes Integration Tests", () => {
    const testAgent = request(app);
    let user, token, hackerToken, analysis, existingLetter;

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
        ({ user, token, hackerToken, analysis, existingLetter } = await createCoverLetterTestData());
    }

    // ==========================================
    // 1. POST: إنشاء خطاب وحفظه
    // ==========================================
    it("(POST /api/cover-letters) should generate and save creative cover letter successfully", async () => {
        await setupData();
        const inputData = mockCoverLetterInput(analysis._id.toString());

        const res = await testAgent
            .post("/api/cover-letters")
            .set("Authorization", `Bearer ${token}`)
            .send(inputData);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.templateType).toBe(inputData.templateType);
        expect(res.body.data.companyName).toBe(inputData.companyName);
        
        expect(res.body.data.generatedCoverLetter).toContain(mockCreativeTemplateExpectation.bodyHas);
        expect(res.body.data.generatedCoverLetter).toContain("Hagar Developer"); 
    });

    it("(POST /api/cover-letters) should return 404 if analysis does not exist", async () => {
        await setupData();
        const fakeAnalysisId = "6a4ab2363bea96623b9a0723";
        const res = await testAgent
            .post("/api/cover-letters")
            .set("Authorization", `Bearer ${token}`)
            .send({
                analysisId: fakeAnalysisId,
                companyName: "Test Company",
                jobTitle: "Dev"
            });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Analysis data not found");
    });

    // ==========================================
    // 2. GET (ALL): جلب التاريخ
    // ==========================================
    it("(GET /api/cover-letters) should return history logs only for logged in user", async () => {
        await setupData();
        const res = await testAgent
            .get("/api/cover-letters")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(1);
    });

    // ==========================================
    // 3. GET (SINGLE): جلب مستند واحد وحمايته
    // ==========================================
    it("(GET /api/cover-letters/:id) should securely return single document details", async () => {
        await setupData();
        const res = await testAgent
            .get(`/api/cover-letters/${existingLetter._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.companyName).toBe("Google");
    });

    it("(GET /api/cover-letters/:id) should return 403 if a user tries to view another user's cover letter", async () => {
        await setupData();
        const res = await testAgent
            .get(`/api/cover-letters/${existingLetter._id}`)
            .set("Authorization", `Bearer ${hackerToken}`); 

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Not authorized");
    });

    // ==========================================
    // 4. PUT: تحديث الداتا وإعادة البناء
    // ==========================================
    it("(PUT /api/cover-letters/:id) should update inputs and rebuild template text", async () => {
        await setupData();
        const res = await testAgent
            .put(`/api/cover-letters/${existingLetter._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                companyName: "Google Alphabet X",
                templateType: "technical"
            });

        expect(res.status).toBe(200);
        expect(res.body.data.companyName).toBe("Google Alphabet X");
        expect(res.body.data.templateType).toBe("technical");
        expect(res.body.data.generatedCoverLetter).toContain(mockTechnicalTemplateExpectation.bodyHas);
    });

    // ==========================================
    // 5. DELETE: المسح
    // ==========================================
    it("(DELETE /api/cover-letters/:id) should remove document safely from database", async () => {
        await setupData();
        const res = await testAgent
            .delete(`/api/cover-letters/${existingLetter._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toContain("removed from history successfully");

        const checkInDb = await CoverLetter.findById(existingLetter._id);
        expect(checkInDb).toBeNull();
    });
});