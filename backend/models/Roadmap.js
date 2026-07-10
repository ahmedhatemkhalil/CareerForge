import mongoose from "mongoose";

const roadmapWeekSchema = new mongoose.Schema(
    {
        roadmapId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Roadmap",
            required: true,
            index: true,
        },
        weekNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        theme: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: false }
);

roadmapWeekSchema.index({ roadmapId: 1, weekNumber: 1 }, { unique: true });

const resourceSchema = new mongoose.Schema(
    {
        weekId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RoadmapWeek",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["video", "article", "course", "documentation", "book"],
            required: true,
        },
        platform: {
            type: String,
            default: "",
            trim: true,
        },
        isFree: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: false }
);

const roadmapSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        analysisId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Analysis",
            default: null,
            index: true,
        },
        currentRole: {
            type: String,
            trim: true,
            required() {
                return !this.analysisId;
            },
        },
        targetRole: {
            type: String,
            trim: true,
            required() {
                return !this.analysisId;
            },
        },
        matchScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null,
        },
        hoursPerWeek: {
            type: Number,
            min: 0,
            default: 10,
        },
        totalWeeks: {
            type: Number,
            min: 0,
            default: 0,
        },
        completedWeeks: {
            type: Number,
            min: 0,
            default: 0,
        },
        status: {
            type: String,
            enum: ["active", "completed", "paused"],
            default: "active",
        },
        aiTokensUsed: {
            type: Number,
            min: 0,
            default: 0,
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const deleteWeeksForRoadmap = async function deleteWeeksForRoadmap() {
    const roadmapId = this._id ?? this.getQuery()?._id;
    if (!roadmapId) {
        return;
    }

    const weeks = await RoadmapWeek.find({ roadmapId }).select("_id");
    const weekIds = weeks.map((week) => week._id);

    if (weekIds.length > 0) {
        await Resource.deleteMany({ weekId: { $in: weekIds } });
    }

    await RoadmapWeek.deleteMany({ roadmapId });
};

roadmapSchema.pre("deleteOne", { document: true, query: false }, deleteWeeksForRoadmap);
roadmapSchema.pre("deleteMany", deleteWeeksForRoadmap);
roadmapSchema.pre("findOneAndDelete", deleteWeeksForRoadmap);

export const RoadmapWeek = mongoose.model("RoadmapWeek", roadmapWeekSchema);
export const Resource = mongoose.model("Resource", resourceSchema);

export const syncRoadmapProgress = async (roadmapId) => {
    const weeks = await RoadmapWeek.find({ roadmapId }).sort({ weekNumber: 1 });
    const totalWeeks = weeks.length;
    const completedWeeks = weeks.filter((week) => week.completed).length;

    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
        return null;
    }

    roadmap.totalWeeks = totalWeeks;
    roadmap.completedWeeks = completedWeeks;
    roadmap.progress = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

    if (totalWeeks > 0 && completedWeeks === totalWeeks) {
        roadmap.status = "completed";
    } else if (roadmap.status === "completed") {
        roadmap.status = "active";
    }

    await roadmap.save();
    return roadmap;
};

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;