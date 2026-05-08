
import Roadmap from "../../models/Roadmap.js";

const buildFakeRoadmapData = (currentRole, targetRole) => ({
    skillGaps: [
        "System Design and Architecture",
        "Team Leadership",
        "Advanced TypeScript",
        "Performance Optimization",
        "Mentoring junior developers",
    ],
    timeline: "3-5 months",
    weeklyPlan: [
        {
            week: 1,
            focus: "TypeScript Advanced Features",
            resource: "TypeScript Official Handbook",
            completed: false,
        },
        {
            week: 2,
            focus: "System Design Basics",
            resource: "YouTube: System Design Interview",
            completed: false,
        },
        {
            week: 3,
            focus: "Performance Optimization",
            resource: "Web.dev: Optimize your app",
            completed: false,
        },
        {
            week: 4,
            focus: "Leadership & Mentoring",
            resource: "Book: The Manager's Path",
            completed: false,
        },
        {
            week: 5,
            focus: `Build a ${targetRole}-level Project`,
            resource: "GitHub: System design example",
            completed: false,
        },
    ],
});

export const createRoadmap = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const { currentRole, targetRole, hoursPerWeek = 10 } = req.body;

        if (!currentRole || !String(currentRole).trim()) {
            return res.status(400).json({ error: "currentRole is required" });
        }

        if (!targetRole || !String(targetRole).trim()) {
            return res.status(400).json({ error: "targetRole is required" });
        }

        const fakeAI = buildFakeRoadmapData(currentRole, targetRole);

        const roadmap = await Roadmap.create({
            userId: req.user.id,
            currentRole: String(currentRole).trim(),
            targetRole: String(targetRole).trim(),
            hoursPerWeek,
            skillGaps: fakeAI.skillGaps,
            timeline: fakeAI.timeline,
            weeklyPlan: fakeAI.weeklyPlan,
        });

        return res.status(201).json(roadmap);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const getAllRoadmaps = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const roadmaps = await Roadmap.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select("_id currentRole targetRole timeline progress createdAt");

        return res.status(200).json(roadmaps);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
