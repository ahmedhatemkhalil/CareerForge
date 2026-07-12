import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import "./cron/resetUsageCron.js";
import { startInterviewCleanupJob } from "./cron/interviewCleanup.cron.js";
import { isEmailConfigured, getEmailProviderName } from "./Email/email.js";

const startServer = async () => {
    await connectDB();
    startInterviewCleanupJob();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        if (isEmailConfigured()) {
            console.log(`✉️  Email configured via ${getEmailProviderName()}`);
        } else {
            console.log("⚠️  Email NOT configured — set SENDGRID_API_KEY (production) or EMAIL_USER + EMAIL_PASS (local)");
        }
    });
};

startServer();