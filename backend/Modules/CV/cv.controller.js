import { CV } from '../../models/CV/CV.js';
import { catchAsync, AppError } from '../../utils/validators.js';
import cloudinary from '../../config/cloudinary.js';
import { extractTextFromFile } from '../../services/fileParser.js';
import fs from 'fs';

// 1. Upload CV (POST)
export const uploadCV = catchAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError("Please upload a CV file", 400));

    const fileSizeKb = Math.round(req.file.size / 1024);

    const latestCv = await CV.findOne({ userId: req.user.id }).sort({ version: -1 });
    const nextVersion = latestCv ? latestCv.version + 1 : 1;

    let uploadResult;
    try {
        uploadResult = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'auto',
            folder: 'careerforge/cvs'
        });
    } catch (err) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return next(new AppError("Cloudinary upload failed", 500));
    }

    const newCv = await CV.create({
        userId: req.user.id,
        fileUrl: uploadResult.secure_url,
        fileName: req.file.originalname,
        fileSizeKb,
        version: nextVersion,
        status: 'processing',
        isActive: true // ستقوم الـ Pre-save hook بإلغاء تفعيل الباقي تلقائياً
    });

    const localFilePath = req.file.path;
    setImmediate(async () => {
        try {
            const text = await extractTextFromFile(localFilePath, newCv.fileName);
            await CV.findByIdAndUpdate(newCv._id, { 
                extractedText: text, 
                status: 'completed' 
            });
        } catch (error) {
            console.error(`❌ Async Extraction Failed for CV ${newCv._id}:`, error.message);
            await CV.findByIdAndUpdate(newCv._id, { status: 'failed' });
        } finally {
            if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        }
    });

    res.status(201).json({
        success: true,
        data: {
            cvId: newCv._id,
            fileUrl: newCv.fileUrl,
            status: newCv.status,
            message: "CV uploaded successfully. Text extraction in progress."
        }
    });
});

// 2. Get All CVs for User (GET)
export const getAllCvs = catchAsync(async (req, res, next) => {
    const { activeOnly, limit = 10, page = 1 } = req.query;
    
    let filter = { userId: req.user.id };
    if (activeOnly === 'true') filter.isActive = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const cvs = await CV.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('id fileName version isActive status createdAt');

    const total = await CV.countDocuments(filter);

    res.json({
        success: true,
        data: {
            cvs,
            pagination: { page: parseInt(page), limit: parseInt(limit), total }
        }
    });
});

// 3. Get Single CV (GET)
export const getCvById = catchAsync(async (req, res, next) => {
    const query = { _id: req.params.cvId };
    if (req.user.role !== 'admin') {
        query.userId = req.user.id;
    }

    const cv = await CV.findOne(query);
    if (!cv) return next(new AppError("CV not found or unauthorized", 404));

    res.json({
        success: true,
        data: {
            id: cv._id,
            fileName: cv.fileName,
            fileUrl: cv.fileUrl,
            extractedText: cv.extractedText,
            status: cv.status,
            version: cv.version,
            isActive: cv.isActive,
            fileSizeKb: cv.fileSizeKb,
            uploadedAt: cv.createdAt
        }
    });
});

// 4. Delete CV (DELETE)
export const deleteCV = catchAsync(async (req, res, next) => {
    const cv = await CV.findOne({ _id: req.params.cvId, userId: req.user.id });
    if (!cv) return next(new AppError("CV not found or unauthorized", 404));

    try {
        if (cv.fileUrl) {
            const urlParts = cv.fileUrl.split('/');
            const fileWithExt = urlParts[urlParts.length - 1];
            const publicId = `careerforge/cvs/${fileWithExt.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (err) {
        console.error("Cloudinary delete failed, continuing DB removal:", err.message);
    }

    await CV.findByIdAndDelete(cv._id);

    res.status(200).json({
        success: true,
        message: "CV deleted successfully"
    });
});