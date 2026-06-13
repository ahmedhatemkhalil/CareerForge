import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true 
    },
    cvId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CV', 
        required: true 
    },
    jobId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'JobDescription', 
        required: true 
    },
    version: { type: Number, default: 1 },
    matchScore: { type: Number, min: 0, max: 100, default: 0 }, 
    strengths: [String],
    weaknesses: [String],
    skillGaps: [String], 
    matchedJobs: [{ 
        title: String,
        company: String,
        url: String
    }],
    recommendedActions: [String],
    improvedSuggestions: [{
        original: String,
        improved: String
    }],
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    aiModelUsed: { type: String, default: 'Gemini-Langflow' },
    tokensUsed: { type: Number, default: 0 }
}, { timestamps: true });

export const Analysis = mongoose.model('Analysis', analysisSchema);