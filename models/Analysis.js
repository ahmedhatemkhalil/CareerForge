import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true 
    },
    cvText: { type: String, required: true, trim: true },
    cvFileUrl: { type: String, required: true },
    jobDescription: { type: String, trim: true },
    strengths: [String],
    weaknesses: [String],
    matchedJobs: [String],
    missingSkills: [String],
    recommendedActions: [String],
    atsScore: { type: Number, min: 0, max: 100 }
}, { timestamps: true });

export const Analysis = mongoose.model('Analysis', analysisSchema);