import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { Analysis } from "../../models/Analysis.js";
import CoverLetter from "../../models/CoverLetter.js";

export async function createCoverLetterTestData() {
    // 1. إنشاء مستخدم رئيسي بصلاحية كاملة وباسورد طويل ومقبول في الـ Validation
    const user = await User.create({
        name: "Hagar Developer",
        email: "hagar@forge.com",
        password_hash: "$2b$10$MOCKHASHFORHAGARSUPERSECRET123456", // تم التعديل لهش طويل
        status: "active"
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "testsecret");

    // 2. مستخدم آخر لتجربة محاولات الاختراق
    const hacker = await User.create({
        name: "Hacker Person",
        email: "hacker@forge.com",
        password_hash: "$2b$10$MOCKHASHFORHACKERSUPERSECRET123456" // تم التعديل لهش طويل
    });
    const hackerToken = jwt.sign({ id: hacker._id }, process.env.JWT_SECRET || "testsecret");

    // 3. إنشاء داتا تحليل وهمية لقراءة الـ Strengths منها
    const analysis = await Analysis.create({
        userId: user._id,
        cvId: "6a4ab7dcd277b3a35f6c4823",
        jobId: "6a4ab7ddd277b3a35f6c4824",
        matchScore: 90,
        strengths: ["Node.js Architecture", "MongoDB Query Optimization", "Clean Code Paradigms"],
        status: "completed"
    });

    // 4. إنشاء كفر ليتر مسجل بالفعل في الـ History
    const existingLetter = await CoverLetter.create({
        userId: user._id,
        analysisId: analysis._id,
        companyName: "Google",
        jobTitle: "Backend Engineer",
        hrName: "John Doe",
        templateType: "technical",
        generatedCoverLetter: "Initial Tech Content",
        generatedEmail: "Initial Email Content"
    });

    return { user, token, hackerToken, analysis, existingLetter };
}