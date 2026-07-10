import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { CV } from "../../models/CV/CV.js";

export async function createCvTestData() {
    const user = await User.create({
        name: "CV Test User",
        email: "cvtest@test.com",
        password_hash: "123456",
        usage: { interviewsThisMonth: 0 }
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

    return { user, token, cv };
}

