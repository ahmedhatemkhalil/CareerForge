import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { CV } from "../../models/CV/CV.js";
import { JobDescription } from "../../models/jobDescription/JobDescription.js";
import { Analysis } from "../../models/Analysis.js";

export async function createAnalysisTestData() {
    const user = await User.create({
        name: "Analysis User",
        email: "analysis@test.com",
        password_hash: "123456",
        plan: "pro",
        usage: { analysesThisMonth: 0 },
        maxLimits: { analysesPerMonth: 20 }
    });

    const token = jwt.sign(
        { id: user._id, role: "user" },
        process.env.JWT_SECRET || "testsecret",
        { expiresIn: "1h" }
    );

const cv = await CV.create({
    userId: user._id,
    fileUrl: "https://res.cloudinary.com/mock/resume.pdf",
    fileName: "resume.pdf",
    fileSizeKb: 150, 
    status: "completed",
    extractedText: "Test Resume Content"
});
    const job = await JobDescription.create({
        createdBy: user._id,
        title: "Backend Dev",
        descriptionText: "Node.js required"
    });

    const analysis = await Analysis.create({
        userId: user._id,
        cvId: cv._id,
        jobId: job._id,
        matchScore: 85,
        strengths: ["Node.js"],
        weaknesses: ["Testing"],
        skillGaps: ["CI/CD"],
        status: "completed"
    });

    return { user, token, cv, job, analysis };
}