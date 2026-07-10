import { Router } from 'express';
import * as jobController from './job.controller.js'; 
import { verifyToken } from '../../middleware/auth.js';
import { createJobSchema } from '../../models/jobDescription/job.validation.js';

const router = Router();

// الـ Middleware الخاص بالـ Validation
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { stripUnknown: true }); 
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    req.body = value; 
    next();
};

router.use(verifyToken);

// الـ Endpoints
router.post('/', validate(createJobSchema), jobController.createJobDescription);
router.get('/', jobController.getMyJobDescriptions);

router.get('/:id', jobController.getJobDescriptionById);
router.put('/:id', jobController.updateJobDescription);
router.delete('/:id', jobController.deleteJobDescription);

export default router;
