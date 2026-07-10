import request from "supertest";
import app from "../../app.js";
import { CV } from "../../models/CV/CV.js";
import cloudinary from "../../config/cloudinary.js";
import * as fileParser from "../../services/fileParser.js";
import { connectToTestDatabase, clearDatabase, closeDatabase } from "../../config/test-db.js";
import { createCvTestData } from "./cv.helper.js";
import { mockCloudinaryUploadResponse } from "./cv.mock.js";

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

  it("(POST /api/cvs/upload) should return 401 if unauthorized", async () => {
    const res = await testAgent.post("/api/cvs/upload");

    expect(res.status).toBe(401);
  });

  it("(POST /api/cvs/upload) should return 400 when no file is uploaded", async () => {
    await setupData();

    const res = await testAgent
      .post("/api/cvs/upload")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please upload a CV file");
  });

  it("(POST /api/cvs/upload) should return 400 for unsupported file type", async () => {
    await setupData();

    const res = await testAgent
      .post("/api/cvs/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("cvFile", Buffer.from("plain text"), {
        filename: "notes.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Unsupported file type. Only PDF, DOCX, and DOC are allowed!",
    );
  });

  it("(POST /api/cvs/upload) should upload CV and save it to the database", async () => {
    await setupData();

    spyOn(cloudinary.uploader, "upload").and.resolveTo(
      mockCloudinaryUploadResponse,
    );
    spyOn(fileParser, "extractTextFromFile").and.resolveTo("Extracted CV text");

    const res = await testAgent
      .post("/api/cvs/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("cvFile", Buffer.from("%PDF-1.4 fake pdf content"), {
        filename: "new-resume.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cvId).toBeDefined();
    expect(res.body.data.fileUrl).toBe(mockCloudinaryUploadResponse.secure_url);
    expect(res.body.data.status).toBe("processing");

    const savedCv = await CV.findById(res.body.data.cvId);
    expect(savedCv).not.toBeNull();
    expect(savedCv.userId.toString()).toBe(user._id.toString());
    expect(savedCv.fileName).toBe("new-resume.pdf");
    expect(savedCv.version).toBe(1);
    expect(savedCv.isActive).toBe(true);
  });

  it("(POST /api/cvs/upload) should increment version for same file name", async () => {
    await setupData();

    spyOn(cloudinary.uploader, "upload").and.resolveTo(
      mockCloudinaryUploadResponse,
    );
    spyOn(fileParser, "extractTextFromFile").and.resolveTo("Extracted CV text");

    const firstUpload = await testAgent
      .post("/api/cvs/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("cvFile", Buffer.from("%PDF-1.4 first upload"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });

    const secondUpload = await testAgent
      .post("/api/cvs/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("cvFile", Buffer.from("%PDF-1.4 second upload"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });

    expect(firstUpload.status).toBe(201);
    expect(secondUpload.status).toBe(201);

    const firstCv = await CV.findById(firstUpload.body.data.cvId);
    const secondCv = await CV.findById(secondUpload.body.data.cvId);

    expect(firstCv.version).toBe(2);
    expect(secondCv.version).toBe(3);
  });

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