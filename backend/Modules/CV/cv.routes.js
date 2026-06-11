import { Router } from 'express';
import * as cvController from '../../Modules/CV/cv.controller.js';
import { upload } from '../../config/multer.js';
import { verifyToken } from '../../middleware/auth.js';
import { getCvByIdSchema, queryCvSchema } from '../../models/CV/cv.validation.js';

const router = Router();

const validate = (schema, source = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[source], { stripUnknown: true }); 
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    req[source] = value; 
    next();
};

router.use(verifyToken);

router.post('/upload', upload.single('cvFile'), cvController.uploadCV);
router.get('/', validate(queryCvSchema, 'query'), cvController.getAllCvs);
router.get('/:cvId', validate(getCvByIdSchema, 'params'), cvController.getCvById);
router.delete('/:cvId', validate(getCvByIdSchema, 'params'), cvController.deleteCV);

export default router;