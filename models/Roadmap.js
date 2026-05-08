import mongoose from "mongoose";

const weeklyPlanSchema = new mongoose.Schema(
    {
        week: {
            type: Number,
            required: true,
            min: 1,
        },
        focus: {
            type: [String],
            required: true,
            trim: true,
        },
        resource: {
            type: [String],
            required: true,
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const roadmapSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        currentRole: {
            type: String,
            required: true,
            trim: true,
        },
        targetRole: {
            type: String,
            required: true,
            trim: true,
        },
        hoursPerWeek: {
            type: Number,
            min: 0,
            default: 10,
        },
        skillGaps: {
            type: [String],
            default: [],
        },
        timeline: {
            type: String,
            default: "",
            trim: true,
        },
        weeklyPlan: {
            type: [weeklyPlanSchema],
            default: [],
        },
     
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
    },
    { timestamps: true }
);

roadmapSchema.methods.calculateProgress = function calculateProgress() {
    if (!this.weeklyPlan || this.weeklyPlan.length === 0) {
        this.progress = 0;
        return this.progress;
    }

    const completedWeeks = this.weeklyPlan.filter((week) => week.completed).length;
    this.progress = Math.round((completedWeeks / this.weeklyPlan.length) * 100);
    return this.progress;
};

roadmapSchema.pre("save", function preSave() {
    this.calculateProgress();
});



roadmapSchema.index({ userId: 1 });

export default mongoose.model("Roadmap", roadmapSchema); 