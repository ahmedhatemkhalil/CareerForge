import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import SubscriptionPlan from "../../models/SubscriptionPlan.js";

export async function createPlanTestData() {
    // إنشاء يوزر أدمن بباسورد مقبول
    const adminUser = await User.create({
        name: "Admin Boss",
        email: "admin@forge.com",
        password_hash: "$2b$10$MOCKHASHFORADMINSUPERSECRET123456", // عدلنا الـ 123 لهش طويل
        role: "admin",
        status: "active"
    });

    const adminToken = jwt.sign(
        { id: adminUser._id, role: adminUser.role },
        process.env.JWT_SECRET || "testsecret"
    );

    // إنشاء يوزر عادي بباسورد طويل ومقبول
    const normalUser = await User.create({
        name: "Normal User",
        email: "normal@forge.com",
        password_hash: "$2b$10$MOCKHASHFORUSERSUPERSECRET123456", // عدلنا الـ 123 لهش طويل
        role: "user",
        status: "active"
    });

    const normalToken = jwt.sign(
        { id: normalUser._id, role: normalUser.role },
        process.env.JWT_SECRET || "testsecret"
    );

    // إنشاء خطة جاهزة للاختبار
    const existingPlan = await SubscriptionPlan.create({
        name: "Pro",
        limits: {
            analysesPerMonth: 30,
            interviewsPerMonth: 15,
            roadmapsPerMonth: 10
        }
    });

    return { adminToken, normalToken, existingPlan };
}