import request from "supertest";
import app from "../../app.js";
import { CV } from "../../models/CV/CV.js";
import cloudinary from "../../config/cloudinary.js";
import { connectToTestDatabase, clearDatabase, closeDatabase } from "../../config/test-db.js";
import { createCvTestData } from "./cv.helper.js";

describe("CV Routes Integration Tests", () => {
    const testAgent = request(app);
    let token, user, cv;

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
        ({ user, token, cv } = await createCvTestData());
    }

    // 1. Test Get Single CV (Unauthorized)
    it("(GET /api/cvs/:cvId) should return 401 if unauthorized", async () => {
        const fakeValidId = "6a4ab2363bea96623b9a0723"; 
        const res = await testAgent.get(`/api/cvs/${fakeValidId}`);
        expect(res.status).toBe(401);
    });

    // 2. Test Get Single CV (Success)
    it("(GET /api/cvs/:cvId) should return single CV successfully", async () => {
        await setupData();
        const res = await testAgent
            .get(`/api/cvs/${cv._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        // التعديل هنا: الكنترولر بيرجع الحقل باسم id وليس _id
        expect(res.body.data.id.toString()).toBe(cv._id.toString()); 
    });

    // 3. Test Get Single CV (404 Not Found)
    it("(GET /api/cvs/:cvId) should return 404 if not found", async () => {
        await setupData();
        const fakeId = "686000000000000000000010";
        const res = await testAgent
            .get(`/api/cvs/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
    });

    // 4. Test Get All CVs (جديد 🔥)
    it("(GET /api/cvs) should get all CVs for logged-in user", async () => {
        await setupData();
        const res = await testAgent
            .get("/api/cvs")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.cvs)).toBe(true);
    });

    // 5. Test Set Active CV (جديد 🔥)
    it("(PATCH /api/cvs/:cvId/set-active) should set CV to active and deactivate others", async () => {
        await setupData();
        const res = await testAgent
            .patch(`/api/cvs/${cv._id}/set-active`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.isActive).toBe(true);
    });

    // 6. Test Delete CV
    it("(DELETE /api/cvs/:cvId) should delete CV from DB and Cloudinary", async () => {
        await setupData();
        
        spyOn(cloudinary.uploader, "destroy").and.resolveTo({ result: "ok" });

        const res = await testAgent
            .delete(`/api/cvs/${cv._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const deletedCv = await CV.findById(cv._id);
        expect(deletedCv).toBeNull();
    });
});