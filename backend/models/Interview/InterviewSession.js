import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    analysis_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Analysis",
        required: true,
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true,
    },
    overall_score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
    },
    overall_feedback: {
        type: String,
        default: null,
    },
    tips_for_improvement: {
        type: [String], 
        default: [],
    },

    hiringRecommendation: {
        type: String,
        enum: [
            "Strong Hire",
            "Hire",
            "Consider",
            "No Hire"
        ],
        default: null,
    },

    status: {
        type: String,
        enum: ["in_progress", "completed"],
        default: "in_progress",
    },

    total_questions: {
    type: Number,
    min: 5,
    max: 8,
    default: null
    },

    ai_tokens_used: {
        type: Number,
        default: 0,
    },

    langflow_session_id: {
        type: String,
        required: true,
    },
    
    started_at: {
        type: Date,
        default: Date.now,
    },

    completed_at: {
        type: Date,
        default: null,
    },

    },
    { 
        timestamps: true,
        versionKey: false
});

interviewSessionSchema.index({ user_id: 1, status: 1 });

export const interviewSessionModel = mongoose.model("InterviewSession", interviewSessionSchema);