import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password_hash: { type: String, required: true, minlength: 6 },

    avatar_url: { type: String, default: null },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },

    // customColors: {
    //   type: Object,
    //   default: {},
    // },

    ban_reason: { type: String, default: null },

    is_verified: { type: Boolean, default: false },

    stripeCustomerId: {
      type: String,
      default: null,
    },

    stripeSubscriptionId: {
      type: String,
      default: null,
    },

    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },

    subscriptionStatus: {
      type: String,
      default: null,
    },

    subscriptionCurrentPeriodEnd: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    usage: {
      analysesThisMonth: { type: Number, default: 0 },
      interviewsThisMonth: { type: Number, default: 0 },
      roadmapsThisMonth: { type: Number, default: 0 }
    },

    last_login_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.model("User", userSchema);
