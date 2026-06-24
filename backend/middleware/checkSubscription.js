import User from "../models/User.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";

export const checkSubscription = (feature) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: "Unauthorized. Please log in." });
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            const { plan, usage } = user;

            const planDetails = await SubscriptionPlan.findOne({ name: plan });
            
            const currentLimits = planDetails ? planDetails.limits : {
                analysesPerMonth: 2,
                interviewsPerMonth: 1,
                roadmapsPerMonth: 1
            };

            let isLimitReached = false;
            let currentUsage = 0;
            let maxLimit = 0;

            if (feature === "analysis") {
                isLimitReached = usage.analysesThisMonth >= currentLimits.analysesPerMonth;
                currentUsage = usage.analysesThisMonth;
                maxLimit = currentLimits.analysesPerMonth;
            } else if (feature === "interview") {
                isLimitReached = usage.interviewsThisMonth >= currentLimits.interviewsPerMonth;
                currentUsage = usage.interviewsThisMonth;
                maxLimit = currentLimits.interviewsPerMonth;
            } else if (feature === "roadmap") {
                isLimitReached = usage.roadmapsThisMonth >= currentLimits.roadmapsPerMonth;
                currentUsage = usage.roadmapsThisMonth;
                maxLimit = currentLimits.roadmapsPerMonth;
            }

            if (isLimitReached) {
                return res.status(403).json({
                    code: "UPGRADE_REQUIRED",
                    feature: feature,
                    message: `You have exceeded your monthly limit for the ${plan} plan. Please upgrade your plan.`,                    usage: currentUsage,
                    limit: maxLimit
                });
            }

            next();
        } catch (error) {
            console.error(`Error in checkSubscription Middleware: ${error.message}`);
            res.status(500).json({ message: "Internal server error." });
        }
    };
};