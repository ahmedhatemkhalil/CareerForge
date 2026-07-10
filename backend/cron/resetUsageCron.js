import cron from "node-cron";
import User from "../models/User.js";

cron.schedule("0 0 1 * *", async () => {
    console.log("⏰ [Cron Job] Starting monthly usage limits reset...");
    try {
        const result = await User.updateMany({}, {
            $set: {
                "usage.analysesThisMonth": 0,
                "usage.interviewsThisMonth": 0,
                "usage.roadmapsThisMonth": 0
            }
        });
        console.log(`✅ [Cron Job] Successfully reset usage for ${result.modifiedCount} users.`);
    } catch (error) {
        console.error(`❌ [Cron Job] Error resetting monthly usage: ${error.message}`);
    }
});