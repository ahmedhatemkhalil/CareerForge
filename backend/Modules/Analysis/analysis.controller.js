import { Analysis } from "../../models/Analysis.js";
import { CV } from "../../models/CV/CV.js";
import User from "../../models/User.js";
import { catchAsync, AppError } from "../../utils/validators.js";
import * as analysisService from "../../services/geminiService.js";
import Roadmap from "../../models/Roadmap.js";
import { interviewSessionModel } from "../../models/Interview/InterviewSession.js";

// 1. Create Analysis (POST)
export const createAnalysis = catchAsync(async (req, res, next) => {
  const { cvId, jobId } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));

  const userPlanName = req.body.plan || user.plan || "free"; 
  
  const allowedLimit = user.maxLimits?.analysesPerMonth || (userPlanName === "pro" ? 50 : 2);
  const currentUsage = user.usage?.analysesThisMonth || 0;

  if (currentUsage >= allowedLimit) {
return next(new AppError(`You have exceeded your monthly analysis limit for your current plan (Maximum allowed: ${allowedLimit}). Please upgrade your plan.`, 403));  }

  const cvData = await CV.findOne({ _id: cvId, userId: req.user.id });
  if (!cvData) return next(new AppError("CV not found or unauthorized", 404));

  const latestAnalysis = await Analysis.findOne({ cvId, jobId }).sort({ version: -1 });
  const nextVersion = latestAnalysis ? latestAnalysis.version + 1 : 1;

  const aiResults = await analysisService.processAIAnalysisSync(cvData.extractedText, jobId);

  const newAnalysis = await Analysis.create({
    userId: req.user.id,
    cvId,
    jobId,
    version: nextVersion,
    matchScore: aiResults.matchScore,
    strengths: aiResults.strengths,
    weaknesses: aiResults.weaknesses,
    skillGaps: aiResults.skillGaps,
    recommendedActions: aiResults.recommendedActions,
    improvedSuggestions: aiResults.improvedSuggestions,
    matchedJobs: aiResults.matchedJobs,
    status: "completed",
    aiModelUsed: "Gemini-Langflow",
  });

  await User.findByIdAndUpdate(req.user.id, { 
    $inc: { "usage.analysesThisMonth": 1 } 
  });

  res.status(201).json({
    success: true,
    message: "Analysis completed successfully",
    data: newAnalysis,
  });
});

// 2. Get Single Analysis (GET)
export const getSingleAnalysis = catchAsync(async (req, res, next) => {
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user.id,
  })
    .populate("cvId", "fileName")
    .populate("jobId");

  if (!analysis) return next(new AppError("Analysis not found", 404));

  res.json({
    success: true,
    data: analysis,
  });
});

// 3. Get All Analyses for User (GET)
export const getAllAnalyses = catchAsync(async (req, res, next) => {
  const analyses = await Analysis.find({ userId: req.user.id })
    .populate({
      path: 'cvId', 
      select: 'fileName' 
    })
    .populate({
      path: 'jobId', 
      select: 'title' 
    })
    .sort({
      createdAt: -1,
    });

  res.json({
    success: true,
    results: analyses.length,
    data: analyses,
  });
  console.log("USER IN GET:", req.user.id);
console.log("ANALYSES FOUND:", analyses.length);
console.log("ANALYSES:", analyses);
});

// 4. Delete Analysis (DELETE)
export const deleteAnalysis = catchAsync(async (req, res, next) => {
  const analysis = await Analysis.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!analysis) {
    return next(new AppError("Analysis not found or unauthorized", 404));
  }
  await Roadmap.findOneAndDelete({ analysisId: req.params.id });

  await interviewSessionModel.deleteMany({ analysis_id: req.params.id });

  res.status(200).json({
    success: true,
    message: "Analysis and all related career assets deleted successfully",
  });
});