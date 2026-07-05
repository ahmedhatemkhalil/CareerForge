import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { JobDescription } from "../../models/jobDescription/JobDescription.js";

export async function createJobTestData() {
    const user = await User.create({
        name: "Job Test User",
        email: "jobtest@test.com",
        password_hash: "123456",
        status: "active",
        usage: { interviewsThisMonth: 0 }
    });

    const token = jwt.sign(
        { id: user._id, role: "user" },
        process.env.JWT_SECRET || "testsecret",
        { expiresIn: "1h" }
    );

    const job = await JobDescription.create({
        createdBy: user._id,
        title: "Frontend React Developer",
        descriptionText: "Looking for React & Tailwind developer"
    });

    return { user, token, job };
}