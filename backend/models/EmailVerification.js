import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        token: {
            type: String,
            required: true,
            unique: true,
        },

        is_used: {
            type: Boolean,
            default: false,
        },

        expires_at: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: false,
        },
    }
);
emailVerificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("EmailVerification",emailVerificationSchema);