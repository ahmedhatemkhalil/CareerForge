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
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!analysis) {
        return next(new AppError("Analysis not found", 404));
    }

    await analysisService.deleteFromCloudinary(analysis.cvFileUrl);
    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: "Deleted from DB and Cloudinary" });
});

// 4. Update - PUT (مع فحص الملكية)
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