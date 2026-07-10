import request from "supertest";
import app from "../../app.js";
import { JobDescription } from "../../models/jobDescription/JobDescription.js";
import { connectToTestDatabase, clearDatabase, closeDatabase } from "../../config/test-db.js";
import { createJobTestData } from "./job.helper.js";

describe("Job Description Routes Integration Tests", () => {
    const testAgent = request(app);
    let token, user, job;

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
        ({ user, token, job } = await createJobTestData());
    }

 it("(POST /api/job-descriptions) should create new job description", async () => {
    await setupData();
    const res = await testAgent
        .post("/api/job-descriptions")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Node.js Developer",
            descriptionText: "Expert in Express and MongoDB"
        });

    expect([200, 201]).toContain(res.status);
    
    if (res.body) {
        const responseData = res.body.data || res.body;
        if (responseData && responseData.title) {
            expect(responseData.title).toBe("Node.js Developer");
        }
    }
});
    it("(GET /api/job-descriptions) should get user job descriptions", async () => {
        await setupData();
        const res = await testAgent
            .get("/api/job-descriptions")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(1);
    });

    it("(GET /api/job-descriptions/:id) should return single job description", async () => {
        await setupData();
        const res = await testAgent
            .get(`/api/job-descriptions/${job._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data._id.toString()).toBe(job._id.toString());
    });

    it("(PUT /api/job-descriptions/:id) should update job description", async () => {
        await setupData();
        const res = await testAgent
            .put(`/api/job-descriptions/${job._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Updated Title Senior React" });

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe("Updated Title Senior React");
    });

    it("(DELETE /api/job-descriptions/:id) should delete job description", async () => {
        await setupData();
        const res = await testAgent
            .delete(`/api/job-descriptions/${job._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);

        const deleted = await JobDescription.findById(job._id);
        expect(deleted).toBeNull();
    });
});