import Joi from 'joi';

export const createJobSchema = Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
        'string.empty': 'Job title is required',
        'string.min': 'Title must be at least 3 characters'
    }),
    descriptionText: Joi.string().min(20).required().messages({
        'string.empty': 'Job description text is required',
        'string.min': 'Description must be at least 20 characters'
    })
});