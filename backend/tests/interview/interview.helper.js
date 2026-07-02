import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { Analysis } from "../../models/Analysis.js";
import { JobDescription } from "../../models/jobDescription/JobDescription.js";
import { interviewSessionModel } from "../../models/Interview/InterviewSession.js";
import { interviewQuestionModel } from "../../models/Interview/InterviewQuestion.js";

export const JOB_TITLE = "Frontend Developer";
export const SESSION_ID = "abc123";

export async function createUserAndToken() {
    const user = await User.create({
        name: "Test User",
        email: "test@test.com",
        password_hash: "123456",
        usage: {
            interviewsThisMonth: 0,
        },
    });

    const token = jwt.sign(
        {
            id: user._id,
            role: "user",
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );

    const job = await JobDescription.create({
        createdBy: user._id,
        title: JOB_TITLE,
        descriptionText: "React Developer Job Description",
    });

    const analysis = await Analysis.create({
        userId: user._id,
        cvId: "686000000000000000000001",
        jobId: job._id,
        matchScore: 80,
        strengths: ["React"],
        weaknesses: ["Docker"],
        skillGaps: ["AWS"],
        status: "completed",
    });

    return {
        user,
        token,
        analysis,
    };
}

export async function createSession(user, analysis) {
    return interviewSessionModel.create({
        user_id: user._id,
        analysis_id: analysis._id,
        jobTitle: JOB_TITLE,
        langflow_session_id: SESSION_ID,
    });
}

export async function createQuestion(sessionId, order = 1, questionText = "Tell me about yourself") {
    return interviewQuestionModel.create({
        session_id: sessionId,
        question_text: questionText,
        order_index: order,
        answer_status: "pending",
    });
}