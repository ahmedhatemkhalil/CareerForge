import { Router } from 'express';
import * as controller from './analysis.controller.js';
import { upload } from '../../config/multer.js';
import { createAnalysisSchema, updateAnalysisSchema } from './analysis.validation.js';

import { verifyToken } from '../../middleware/auth.js';
const router = Router();

const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { stripUnknown: true }); 
    if (error) return res.status(400).json({ message: error.details[0].message });
    req.body = value; 
    next();
};

router.use(verifyToken); 

router.post('/', upload.single('cvFile'), validate(createAnalysisSchema), controller.createAnalysis);
router.get('/', controller.getAllAnalyses); 
router.get('/:id', controller.getSingleAnalysis);
router.put('/:id', validate(updateAnalysisSchema), controller.updateAnalysis);
router.delete('/:id', controller.deleteAnalysis);

export default router;