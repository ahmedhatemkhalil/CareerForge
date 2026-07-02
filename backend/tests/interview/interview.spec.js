import request from "supertest";
import app from "../../app.js";
import { interviewSessionModel } from "../../models/Interview/InterviewSession.js";
import { interviewQuestionModel } from "../../models/Interview/InterviewQuestion.js";
import { connectToTestDatabase, clearDatabase, closeDatabase } from "../../config/test-db.js";
import interviewService from "../../services/interview.service.js";
import { createUserAndToken, createSession, createQuestion, JOB_TITLE } from "./interview.helper.js";
import { mockStartInterviewResponse, mockContinueInterviewResponse, mockFinishInterviewResponse } from "./interview.mock.js";

describe("Interview Routes", () => {
    const testAgent = request(app);
    let token;
    let user;
    let analysis;

    beforeAll(async () => {
        await connectToTestDatabase();
    });

    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    async function setupTestData() {
        ({ user, token, analysis } = await createUserAndToken());
    }

    it("(GET /api/interviews) without token should return 401", async () => {
        const res = await testAgent.get("/api/interviews");
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/authenticate/i);
    });

    it("(GET /api/interviews) should return []", async () => {
        await setupTestData();
        const res = await testAgent.get("/api/interviews").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveSize(0);
    });

    it("(GET /api/interviews) should return interview list", async () => {
        await setupTestData();
        await interviewSessionModel.create({
            user_id: user._id,
            analysis_id: analysis._id,
            jobTitle: JOB_TITLE,
            langflow_session_id: "session123",
            status: "completed",
            overall_score: 90,
        });

        const res = await testAgent.get("/api/interviews").set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].jobTitle).toBe(JOB_TITLE);
    });

    it("(GET /api/interviews/:id) invalid id should return 400", async () => {
        await setupTestData();
        const res = await testAgent
            .get("/api/interviews/123")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/invalid/i);
    });

    it("(GET /api/interviews/:id) session not found should return 404", async () => {
        await setupTestData();
        const fakeId = "686000000000000000000010";

        const res = await testAgent
            .get(`/api/interviews/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

        it("(GET /api/interviews/:id) should return interview", async () => {
        await setupTestData();
        const session = await createSession(user, analysis);
        await createQuestion(session._id, 1);

        const res = await testAgent
            .get(`/api/interviews/${session._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.session._id.toString()).toBe(session._id.toString());
        expect(res.body.questions).toHaveSize(1);
        expect(res.body.questions[0].question_text).toBe("Tell me about yourself");
    });

    it("(GET /api/interviews/:id) should return ordered questions", async () => {
        await setupTestData();
        const session = await createSession(user, analysis);
        await createQuestion(session._id, 2, "Second Question");
        await createQuestion( session._id, 1, "First Question");

        const res = await testAgent
            .get(`/api/interviews/${session._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.questions.length).toBe(2);
        expect(res.body.questions[0].question_text).toBe("First Question");
        expect(res.body.questions[1].question_text).toBe("Second Question");
    });
    
    it("(DELETE /api/interviews/:id) session not found should return 404", async () => {
        await setupTestData();
        const fakeId = "686000000000000000000010";

        const res = await testAgent
            .delete(`/api/interviews/${fakeId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
    });

    it("(DELETE /api/interviews/:id) should delete interview", async () => {
        await setupTestData();
        const session = await createSession(user, analysis);

        const res = await testAgent
            .delete(`/api/interviews/${session._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);

        const deleted = await interviewSessionModel.findById(session._id);
        expect(deleted).toBeNull();
    });

    it("(DELETE /api/interviews/:id) should delete session and questions", async () => {
        await setupTestData();
        const session = await createSession(user, analysis);
        await createQuestion(session._id, 1);

        await testAgent
            .delete(`/api/interviews/${session._id}`)
            .set("Authorization", `Bearer ${token}`);

        const deletedSession = await interviewSessionModel.findById(session._id);
        const questions = await interviewQuestionModel.find({ session_id: session._id });

        expect(deletedSession).toBeNull();
        expect(questions.length).toBe(0);
    });

    it("(POST /api/interviews/start) should create interview session", async () => {
        await setupTestData();
        spyOn(interviewService, "startInterviewAI").and.resolveTo(mockStartInterviewResponse);

        const res = await testAgent
            .post("/api/interviews/start")
            .set("Authorization", `Bearer ${token}`)
            .send({ analysisId: analysis._id });

        expect(res.status).toBe(201);
        expect(res.body.data.question).toBe(mockStartInterviewResponse.nextQuestion);

        const session = await interviewSessionModel.findOne({ user_id: user._id });
        expect(session).not.toBeNull();

        const questions = await interviewQuestionModel.find({ session_id: session._id }).sort({ order_index: 1 });
        expect(questions.length).toBe(1);
        expect(questions[0].question_text).toBe(mockStartInterviewResponse.nextQuestion);
    });

    it("(POST /api/interviews/:id/answer) should save answer and create next question", async () => {
        await setupTestData();
        const session = await createSession(user, analysis);
        const question = await createQuestion(session._id, 1);

        spyOn(interviewService, "continueInterviewAI").and.resolveTo(mockContinueInterviewResponse);

        const res = await testAgent
            .post(`/api/interviews/${session._id}/answer`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                questionId: question._id,
                answer: "I'm a frontend developer.",
            });

        expect(res.status).toBe(200);

        const updatedQuestion = await interviewQuestionModel.findById(question._id);
        expect(updatedQuestion.user_answer).toBe("I'm a frontend developer.");
        expect(updatedQuestion.ai_feedback).toBe(mockContinueInterviewResponse.feedback);
        expect(updatedQuestion.score).toBe(mockContinueInterviewResponse.score);

        const questions = await interviewQuestionModel.find({ session_id: session._id }).sort({ order_index: 1 });
        expect(questions.length).toBe(2);
        expect(questions[1].question_text).toBe(mockContinueInterviewResponse.nextQuestion);
    });

    it("(POST /api/interviews/:id/answer) should finish interview", async () => {
        await setupTestData();
        const session = await createSession(user, analysis);
        const question = await createQuestion(session._id, 5);
        spyOn(interviewService, "continueInterviewAI").and.resolveTo(mockFinishInterviewResponse);
        const res = await testAgent
            .post(`/api/interviews/${session._id}/answer`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                questionId: question._id,
                answer: "answer",
            });

        expect(res.status).toBe(200);

        const updatedSession = await interviewSessionModel.findById(session._id);
        expect(updatedSession.status).toBe("completed");
        expect(updatedSession.overall_score).toBe(mockFinishInterviewResponse.overallScore);
        expect(updatedSession.overall_feedback).toBe(mockFinishInterviewResponse.generalFeedback);
        expect(updatedSession.hiringRecommendation).toBe(mockFinishInterviewResponse.hiringRecommendation);
    });
});