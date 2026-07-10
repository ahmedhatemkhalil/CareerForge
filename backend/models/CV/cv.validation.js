import Joi from 'joi';

export const getCvByIdSchema = Joi.object({
    cvId: Joi.string().hex().length(24).required().messages({
        'string.length': 'Invalid CV ID format',
        'any.required': 'CV ID is required'
    })
});

export const queryCvSchema = Joi.object({
    activeOnly: Joi.string().valid('true', 'false').optional(),
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional()
});