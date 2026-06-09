import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "light",
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updated_at" },
  }
);

export default mongoose.model("UserSettings", userSettingsSchema);
