
import Roadmap from "../../models/Roadmap.js";
import mongoose from "mongoose";

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
            focus: ["System Design and Architecture", "Team Leadership", "Advanced TypeScript", "Performance Optimization", "Mentoring junior developers"],
            resource: ["Udemy: System Design and Architecture", "Udemy: Team Leadership", "Udemy: Advanced TypeScript", "Udemy: Performance Optimization", "Udemy: Mentoring junior developers"],
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

export const getRoadmapById = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        const roadmap = await Roadmap.findOne({ _id: id, userId: req.user.id });
        if (!roadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        return res.status(200).json(roadmap);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const updateRoadmapProgress = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const { id } = req.params;
        const { progress } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        if (typeof progress !== "number" || progress < 0 || progress > 100) {
            return res.status(400).json({ error: "Progress must be between 0 and 100" });
        }

        const roadmap = await Roadmap.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { progress },
            { new: true, runValidators: true }
        ).select("_id currentRole targetRole progress timeline createdAt");

        if (!roadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        return res.status(200).json(roadmap);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
