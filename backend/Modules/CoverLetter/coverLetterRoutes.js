// routes/coverLetterRoutes.js
import express from "express";
const router = express.Router();
import * as coverLetterController from './coverLetterController.js';
import {verifyToken} from '../../middleware/auth.js'; 

router.post('/', verifyToken, coverLetterController.generateAndSave);
router.get('/', verifyToken, coverLetterController.getUserCoverLetters);
router.get('/:id', verifyToken, coverLetterController.getSingleCoverLetter);
router.put('/:id', verifyToken, coverLetterController.updateCoverLetter);
router.delete('/:id', verifyToken, coverLetterController.deleteCoverLetter);

export default router;