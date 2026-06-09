import { Analysis } from '../../models/Analysis.js';
import { catchAsync, AppError } from '../../utils/validators.js';
import * as analysisService from '../../services/geminiService.js';
import cloudinary from '../../config/cloudinary.js';

// 1. Create - POST
export const createAnalysis = catchAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError("Please upload your CV", 400));
    
    const result = await analysisService.processAIAnalysis(
        req.user.id, 
        req.file.path,
        req.body.jobDescription
    );
    res.status(201).json({ status: 'success', data: result });
});

// 2. Get Single 
export const getSingleAnalysis = catchAsync(async (req, res, next) => {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!analysis) {
        return next(new AppError("No analysis found with that ID for this user", 404));
    }
    res.json({ status: 'success', data: analysis });
});

export const getAllAnalyses = catchAsync(async (req, res, next) => {
    const analyses = await Analysis.find({ userId: req.user.id });
    res.json({
        status: 'success',
        results: analyses.length,
        data: analyses
    });
});

// 3. Delete 
export const deleteAnalysis = catchAsync(async (req, res, next) => {
    // 1. العثور على التحليل والتأكد من ملكية المستخدم له
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!analysis) {
        return next(new AppError("Analysis not found or unauthorized", 404));
    }

    try {
        if (analysis.cvFileUrl) {
            await analysisService.deleteFromCloudinary(analysis.cvFileUrl);
        }
    } catch (err) {
        console.error("Cloudinary delete failed, but continuing to DB:", err.message);
    }

    await Analysis.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
        status: 'success', 
        message: "Deleted from DB and Cloudinary successfully" 
    });
});

export const updateAnalysis = catchAsync(async (req, res, next) => {
    const oldAnalysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!oldAnalysis) {
        return next(new AppError("Analysis not found", 404));
    }

    if (req.body.jobDescription) {
        const updatedResult = await analysisService.reProcessAIAnalysis(
            req.params.id,
            oldAnalysis.cvText,
            req.body.jobDescription
        );
        return res.json({ status: 'success', data: updatedResult });
    }
    const analysis = await Analysis.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { returnDocument: 'after', runValidators: true }
    );

    res.json({ status: 'success', data: analysis });
});