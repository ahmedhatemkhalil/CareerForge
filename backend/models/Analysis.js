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
    matchedJobs: [{
    title: String,
    company: String,
    url: String
    }],    
    missingSkills: [String],
    recommendedActions: [String],
    atsScore: { type: Number, min: 0, max: 100 },
    improvedSuggestions: [{
        original: String,
        improved: String,
    }], 

}, { timestamps: true });

export const Analysis = mongoose.model('Analysis', analysisSchema);