/**
 * FILE UPLOAD MIDDLEWARE
 * ======================
 * 
 * PURPOSE:
 * This file handles file uploads (CV files) before they reach the controller.
 * It processes multipart/form-data requests.
 * 
 * HOW IT WORKS:
 * 1. Accepts incoming file from the request
 * 2. Validates file type (PDF or DOCX only)
 * 3. Checks file size (max 5MB)
 * 4. Saves file temporarily to 'uploads/' folder
 * 5. Adds file info to req.file for the controller to use
 * 
 * WHO SHOULD TOUCH THIS FILE:
 * - Anyone (set up once, everyone uses it)
 * 
 * WHICH ROUTES USE THIS:
 * - POST /api/analyses (when uploading a CV)
 * 
 * HOW TO USE IN ROUTES:
 * -------------------------------------------------
 * router.post('/', upload.single('cvFile'), controller.createAnalysis);
 *                     ↑
 *              This middleware processes the file
 * -------------------------------------------------
 */