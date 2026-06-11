import { JobDescription } from '../../models/jobDescription/JobDescription.js';
import { catchAsync, AppError } from '../../utils/validators.js';

// 1. Create Job Description (POST)
export const createJobDescription = catchAsync(async (req, res, next) => {
    const { title, descriptionText } = req.body;

    const newJob = await JobDescription.create({
        createdBy: req.user.id,
        title,
        descriptionText
    });

    res.status(201).json({
        success: true,
        data: {
            id: newJob._id,
            title: newJob.title,
            createdAt: newJob.createdAt
        }
    });
});

// 2. Get User's Job Descriptions (GET)
export const getMyJobDescriptions = catchAsync(async (req, res, next) => {
    const jobs = await JobDescription.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    
    res.json({
        success: true,
        data: jobs
    });
});