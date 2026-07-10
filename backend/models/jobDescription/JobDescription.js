import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema({
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true 
    },
    title: { type: String, required: true, trim: true },
    descriptionText: { type: String, required: true, trim: true }
}, { timestamps: true });

export const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);