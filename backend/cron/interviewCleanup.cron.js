import cron from "node-cron";
import { interviewSessionModel } from "../models/Interview/InterviewSession.js";
import { interviewQuestionModel } from "../models/Interview/InterviewQuestion.js";

export const startInterviewCleanupJob = () => {
    cron.schedule("0 * * * *", async () => {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const expiredSessions = await interviewSessionModel.find({
            status: "in_progress",
            started_at: { $lt: cutoff },
        });

        for (const session of expiredSessions) {
            await interviewQuestionModel.deleteMany({
                session_id: session._id,
            });

            await session.deleteOne();
        }

        console.log(`Expired sessions cleaned: ${expiredSessions.length}`);
    });
};