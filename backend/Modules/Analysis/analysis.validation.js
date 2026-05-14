import Joi from 'joi';

export const createAnalysisSchema = Joi.object({
    jobDescription: Joi.string()
        .min(10)
        .optional()
        .messages({
            'string.base': 'Job description must be a string',
            'string.min': 'Job description is too short, must be at least 10 characters',
            'string.empty': 'Job description cannot be empty'
        }),
})

export const updateAnalysisSchema = Joi.object({
    jobDescription: Joi.string().min(10).optional()
});

export const getAnalysisByIdSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        'string.length': 'Invalid Analysis ID format',
        'any.required': 'Analysis ID is required'
    })
});