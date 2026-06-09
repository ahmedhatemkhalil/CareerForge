import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    jobDescription: {
        type: String,
        required: true,
        trim: true,
    },

    status: {
        type: String,
        enum: ["in_progress", "completed"],
        default: "in_progress",
    },

    totalQuestions: {
        type: Number,
        default: 8,
        immutable: true,
    },

    currentQuestionIndex: {
        type: Number,
        default: 0,
    },

    qaList: [
        {
            question: { type: String, required: true },
            userAnswer: { type: String },
            feedback: { type: String, default: null },
            score: { type: Number, min: 0, max: 10, default: null },
        },
    ],

    summary: {
        overallScore: { type: Number, min: 0, max: 10, default: null },
        generalFeedback: { type: String },
        tipsForImprovement: [String],
    },
    },
    { 
        timestamps: true,
        versionKey: false
});

export const interviewModel = mongoose.model("Interview", interviewSchema);