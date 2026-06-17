import { Analysis } from "../../models/Analysis.js";
import { CV } from "../../models/CV/CV.js";
import { catchAsync, AppError } from "../../utils/validators.js";
import * as analysisService from "../../services/geminiService.js";

// 1. Create Analysis (POST)
export const createAnalysis = catchAsync(async (req, res, next) => {
  const { cvId, jobId } = req.body;

  const cvData = await CV.findOne({ _id: cvId, userId: req.user.id });
  if (!cvData) return next(new AppError("CV not found or unauthorized", 404));

  const latestAnalysis = await Analysis.findOne({ cvId, jobId }).sort({
    version: -1,
  });
  const nextVersion = latestAnalysis ? latestAnalysis.version + 1 : 1;

  const aiResults = await analysisService.processAIAnalysisSync(
    cvData.extractedText,
    jobId,
  );

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
console.log("USER IN CREATE:", req.user.id);
console.log("NEW ANALYSIS SAVED:", newAnalysis);
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
  if (!analysis)
    return next(new AppError("Analysis not found or unauthorized", 404));

  res.status(200).json({
    success: true,
    message: "Analysis deleted successfully",
  });
});
