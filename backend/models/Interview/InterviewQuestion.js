import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
    {
        session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewSession",
        required: true,
        },

        question_text: {
        type: String,
        required: true,
        trim: true,
        },

        user_answer: {
        type: String,
        default: null,
        },
        
        answer_status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },

        score: {
        type: Number,
        min: 0,
        max: 10,
        default: null,
        },

        ai_feedback: {
        type: String,
        default: null,
        },

        order_index: {
        type: Number,
        required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);
interviewQuestionSchema.index({ session_id: 1, order_index: 1 }, { unique: true });

export const interviewQuestionModel = mongoose.model("InterviewQuestion", interviewQuestionSchema);