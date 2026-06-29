import mongoose from "mongoose";

export const mockUser = {
  _id: new mongoose.Types.ObjectId().toString(),
  plan: "free",
  usage: { analysesThisMonth: 0 },
  maxLimits: { analysesPerMonth: 2 }
};

export const mockCv = {
  _id: new mongoose.Types.ObjectId().toString(),
  userId: mockUser._id,
  extractedText: "React Node Express MongoDB"
};

export const mockJob = {
  _id: new mongoose.Types.ObjectId().toString(),
  title: "Node.js Developer"
};

export const mockAiResult = {
  matchScore: 85,
  strengths: ["Express"],
  weaknesses: ["Docker"],
  skillGaps: ["AWS"],
  recommendedActions: ["Learn AWS"],
  improvedSuggestions: [],
  matchedJobs: []
};