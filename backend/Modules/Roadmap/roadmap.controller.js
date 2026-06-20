import Roadmap, { RoadmapWeek, Resource, syncRoadmapProgress } from "../../models/Roadmap.js";
import { Analysis } from "../../models/Analysis.js";
import { generateRoadmapPlan } from "../../services/roadmap.service.js";
import mongoose from "mongoose";

const formatResource = (resource) => ({
    _id: resource._id,
    title: resource.title,
    url: resource.url,
    type: resource.type,
    platform: resource.platform,
    isFree: resource.isFree,
});

const formatWeek = (week, resources = []) => ({
    _id: week._id,
    weekNumber: week.weekNumber,
    theme: week.theme,
    description: week.description,
    completed: week.completed,
    completedAt: week.completedAt,
    resources: resources.map(formatResource),
});

const formatRoadmapSummary = (roadmap) => ({
    _id: roadmap._id,
    analysisId: roadmap.analysisId?._id ?? roadmap.analysisId ?? null,
    currentRole: roadmap.currentRole,
    targetRole: roadmap.targetRole,
    matchScore: roadmap.matchScore ?? null,
    hoursPerWeek: roadmap.hoursPerWeek,
    totalWeeks: roadmap.totalWeeks,
    completedWeeks: roadmap.completedWeeks,
    progress: roadmap.progress,
    status: roadmap.status,
    aiTokensUsed: roadmap.aiTokensUsed,
    createdAt: roadmap.createdAt,
    updatedAt: roadmap.updatedAt,
});

const formatRoadmap = (roadmap, weeksWithResources = []) => ({
    ...formatRoadmapSummary(roadmap),
    weeks: weeksWithResources
        .filter((week) => (week.resources || []).length > 0)
        .map((week) => formatWeek(week, week.resources || [])),
});

const attachResourcesToWeeks = async (weeks) => {
    const weekIds = weeks.map((week) => week._id);
    const resources = await Resource.find({ weekId: { $in: weekIds } });

    const resourcesByWeekId = resources.reduce((acc, resource) => {
        const key = String(resource.weekId);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(resource);
        return acc;
    }, {});

    return weeks.map((week) => ({
        ...week.toObject(),
        resources: resourcesByWeekId[String(week._id)] || [],
    }));
};

const getRoadmapWithWeeks = async (roadmapId, userId) => {
    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });

    if (!roadmap) {
        return null;
    }

    const weeks = await RoadmapWeek.find({ roadmapId }).sort({ weekNumber: 1 });
    const weeksWithResources = await attachResourcesToWeeks(weeks);

    return formatRoadmap(roadmap.toObject(), weeksWithResources);
};

const saveWeeksAndResources = async (roadmapId, weeks) => {
    const weeksToSave = weeks.filter((week) => week.resources?.length > 0);

    const insertedWeeks = await RoadmapWeek.insertMany(
        weeksToSave.map(({ resources, ...week }) => ({
            ...week,
            roadmapId,
        }))
    );

    const weekByNumber = Object.fromEntries(
        insertedWeeks.map((week) => [week.weekNumber, week])
    );

    const resourceDocs = weeksToSave.flatMap((week) => {
        const weekDoc = weekByNumber[week.weekNumber];
        if (!weekDoc || !week.resources?.length) {
            return [];
        }

        return week.resources
            .filter((resource) => resource.url)
            .map((resource) => ({
                title: resource.title,
                url: resource.url,
                type: resource.type,
                platform: resource.platform,
                isFree: resource.isFree,
                weekId: weekDoc._id,
            }));
    });

    if (resourceDocs.length > 0) {
        await Resource.insertMany(resourceDocs);
    }
};

const resolveRoadmapInput = async (userId, body) => {
    const { analysisId, currentRole, targetRole, hoursPerWeek = 10 } = body;

    if (analysisId) {
        if (!mongoose.Types.ObjectId.isValid(analysisId)) {
            return { error: "Invalid analysisId", status: 400 };
        }

        const analysis = await Analysis.findOne({ _id: analysisId, userId }).populate(
            "jobId",
            "title descriptionText"
        );

        if (!analysis) {
            return { error: "Analysis not found", status: 404 };
        }

        if (analysis.status !== "completed") {
            return {
                error: "Analysis must be completed before generating a roadmap",
                status: 400,
            };
        }

        const skillGaps = analysis.skillGaps?.length
            ? analysis.skillGaps
            : [];
        const weaknesses = analysis.weaknesses?.length ? analysis.weaknesses : [];

        if (skillGaps.length === 0 && weaknesses.length === 0) {
            return {
                error: "Analysis has no missing skills or weaknesses to build a roadmap from",
                status: 400,
            };
        }

        const jobTitle = analysis.jobId?.title?.trim() || "";
        const resolvedTargetRole =
            String(targetRole || "").trim() || jobTitle || "Target role";

        const plan = await generateRoadmapPlan({
            currentRole: currentRole ? String(currentRole).trim() : "",
            targetRole: resolvedTargetRole,
            hoursPerWeek,
            skillGaps,
            weaknesses,
            strengths: analysis.strengths,
            recommendedActions: analysis.recommendedActions,
            matchScore: analysis.matchScore,
            jobDescription: analysis.jobId?.descriptionText || "",
            jobTitle,
        });

        const roadmapPayload = {
            userId,
            analysisId,
            targetRole: resolvedTargetRole,
            matchScore: analysis.matchScore ?? null,
            hoursPerWeek,
            weeks: plan.weeks,
            aiTokensUsed: plan.aiTokensUsed,
        };

        return { data: roadmapPayload };
    }

    const trimmedCurrentRole = String(currentRole || "").trim();
    const trimmedTargetRole = String(targetRole || "").trim();

    if (!trimmedCurrentRole) {
        return { error: "currentRole is required when analysisId is not provided", status: 400 };
    }

    if (!trimmedTargetRole) {
        return { error: "targetRole is required when currentRole is provided", status: 400 };
    }

    const plan = await generateRoadmapPlan({
        currentRole: trimmedCurrentRole,
        targetRole: trimmedTargetRole,
        hoursPerWeek,
        skillGaps: [],
        weaknesses: [],
    });

    return {
        data: {
            userId,
            analysisId: null,
            currentRole: trimmedCurrentRole,
            targetRole: trimmedTargetRole,
            hoursPerWeek,
            weeks: plan.weeks,
            aiTokensUsed: plan.aiTokensUsed,
        },
    };
};

export const createRoadmap = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const resolved = await resolveRoadmapInput(req.user.id, req.body);
        if (resolved.error) {
            return res.status(resolved.status).json({ error: resolved.error });
        }

        const { weeks, ...roadmapData } = resolved.data;

        const weeksWithResources = weeks.filter((week) => week.resources?.length > 0);

        const roadmap = await Roadmap.create({
            ...roadmapData,
            totalWeeks: weeksWithResources.length,
        });

        await saveWeeksAndResources(roadmap._id, weeksWithResources);
        await syncRoadmapProgress(roadmap._id);

        const result = await getRoadmapWithWeeks(roadmap._id, req.user.id);

        return res.status(201).json(result);
    } catch (err) {
        console.error("Create roadmap error:", err.message);
        return res.status(502).json({
            error: err.message || "Failed to generate roadmap with AI",
        });
    }
};

export const getAllRoadmaps = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const roadmaps = await Roadmap.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select(
                "_id analysisId currentRole targetRole matchScore hoursPerWeek totalWeeks completedWeeks progress status aiTokensUsed createdAt updatedAt"
            );

        return res.status(200).json(roadmaps.map((roadmap) => formatRoadmapSummary(roadmap.toObject())));
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

        const roadmap = await getRoadmapWithWeeks(id, req.user.id);
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
            { returnDocument: "after", runValidators: true }
        ).select(
            "_id analysisId currentRole targetRole matchScore progress totalWeeks completedWeeks status hoursPerWeek createdAt updatedAt"
        );

        if (!roadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        return res.status(200).json(formatRoadmapSummary(roadmap.toObject()));
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const markWeekCompleted = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const { id, weekNum } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        const roadmap = await Roadmap.findOne({ _id: id, userId: req.user.id });
        if (!roadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        const weekNumber = Number(weekNum);
        const week = await RoadmapWeek.findOneAndUpdate(
            { roadmapId: id, weekNumber },
            { completed: true, completedAt: new Date() },
            { returnDocument: "after" }
        );

        if (!week) {
            return res.status(404).json({ error: "Week not found" });
        }

        await syncRoadmapProgress(id);
        const result = await getRoadmapWithWeeks(id, req.user.id);

        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const unmarkWeekCompleted = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const { id, weekNum } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        const roadmap = await Roadmap.findOne({ _id: id, userId: req.user.id });
        if (!roadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        const weekNumber = Number(weekNum);
        const week = await RoadmapWeek.findOneAndUpdate(
            { roadmapId: id, weekNumber },
            { completed: false, completedAt: null },
            { returnDocument: "after" }
        );

        if (!week) {
            return res.status(404).json({ error: "Week not found" });
        }

        await syncRoadmapProgress(id);
        const result = await getRoadmapWithWeeks(id, req.user.id);

        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteRoadmap = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        const deletedRoadmap = await Roadmap.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!deletedRoadmap) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        return res.status(200).json({ message: "Roadmap deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const deleteAllRoadmaps = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Please authenticate" });
        }

        const roadmaps = await Roadmap.find({ userId: req.user.id }).select("_id");
        const roadmapIds = roadmaps.map((roadmap) => roadmap._id);
        const weeks = await RoadmapWeek.find({ roadmapId: { $in: roadmapIds } }).select("_id");
        const weekIds = weeks.map((week) => week._id);

        if (weekIds.length > 0) {
            await Resource.deleteMany({ weekId: { $in: weekIds } });
        }

        await RoadmapWeek.deleteMany({ roadmapId: { $in: roadmapIds } });
        await Roadmap.deleteMany({ userId: req.user.id });

        return res.status(200).json({ message: "All roadmaps deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
