import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
  name: { 
    type: String, 
    enum: ["free", "pro"], 
    required: true, 
    unique: true 
  },
  limits: {
    analysesPerMonth: { type: Number, required: true },
    interviewsPerMonth: { type: Number, required: true },
    roadmapsPerMonth: { type: Number, required: true }
  }
}, { timestamps: true });

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);