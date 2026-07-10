import Joi from 'joi';

const objectIdString = Joi.string().hex().length(24).required();

export const createAnalysisSchema = Joi.object({
    cvId: objectIdString.messages({ 'string.length': 'Invalid CV ID format' }),
    jobId: objectIdString.messages({ 'string.length': 'Invalid Job ID format' })
});

export const updateAnalysisSchema = Joi.object({
    status: Joi.string().valid('pending', 'completed', 'failed').optional(),
    matchScore: Joi.number().min(0).max(100).optional()
});