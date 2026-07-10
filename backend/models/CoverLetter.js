// models/CoverLetter.js
import mongoose from 'mongoose';

const coverLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  hrName: {
    type: String,
    default: 'Hiring Team',
    trim: true
  },
  templateType: { 
    type: String, 
    enum: ['formal', 'creative', 'technical'], // الأنواع المتاحة
    default: 'formal' 
  },
  generatedCoverLetter: {
    type: String,
    required: true
  },
  generatedEmail: {
    type: String,
    required: true
  }
}, { 
  timestamps: true
});

const CoverLetter = mongoose.model('CoverLetter', coverLetterSchema);
export default CoverLetter;