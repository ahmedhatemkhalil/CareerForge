import { Router } from 'express';
import * as cvController from '../../Modules/CV/cv.controller.js';
import { upload } from '../../config/multer.js';
import { verifyToken } from '../../middleware/auth.js';
import { getCvByIdSchema, queryCvSchema } from '../../models/CV/cv.validation.js';

const router = Router();

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        if (!schema) return next();
        
        const { error, value } = schema.validate(req[source], { stripUnknown: true }); 
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        
        if (source === 'body') {
            req.body = value;
        } else {
            Object.keys(req[source]).forEach(key => delete req[source][key]);
            Object.assign(req[source], value);
        }
        
        next();
    };
};

router.post('/upload', verifyToken, upload.single('cvFile'), cvController.uploadCV);
router.get('/', verifyToken, validate(queryCvSchema, 'query'), cvController.getAllCvs);
router.get('/:cvId', verifyToken, validate(getCvByIdSchema, 'params'), cvController.getCvById);
router.delete('/:cvId', verifyToken, validate(getCvByIdSchema, 'params'), cvController.deleteCV);
router.patch('/:cvId/set-active', verifyToken, cvController.setActiveCv);
export default router;
