import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import "./cron/resetUsageCron.js";
import { startInterviewCleanupJob } from "./cron/interviewCleanup.cron.js";

const startServer = async () => {
    await connectDB();
    startInterviewCleanupJob();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

startServer();