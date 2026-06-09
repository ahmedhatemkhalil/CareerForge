import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        refresh_token: {
            type: String,
            required: true,
            unique: true,
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
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("Session", sessionSchema);