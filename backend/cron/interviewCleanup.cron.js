import cron from "node-cron";
import { interviewSessionModel } from "../models/Interview/InterviewSession.js";
import { interviewQuestionModel } from "../models/Interview/InterviewQuestion.js";

export const startInterviewCleanupJob = () => {
    console.log("Interview Cleanup Job Registered");
    cron.schedule("0 * * * *", async () => {
        try {
            const now = new Date();
            const twentyFourHoursAgo = new Date(
                now.getTime() - 24 * 60 * 60 * 1000
            );

            const expiredSessions = await interviewSessionModel.find({
                status: "in_progress",
                started_at: { $lt: twentyFourHoursAgo },
            });

            if (!expiredSessions.length) return;

            const sessionIds = expiredSessions.map(s => s._id);

            await interviewQuestionModel.deleteMany({
                session_id: { $in: sessionIds }
            });

            await interviewSessionModel.deleteMany({
                _id: { $in: sessionIds }
            });

            console.log(`[Cleanup] Deleted ${sessionIds.length} sessions`);

        } catch (error) {
            console.error("Cleanup Job Error:", error);
        }
    });
};