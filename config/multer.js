/**
 * FILE UPLOAD CONFIGURATION FILE
 * ===============================
 * 
 * PURPOSE:
 * This file configures how our server handles file uploads (CV files).
 * Users will upload PDF or DOCX files for analysis.
 * 
 * HOW IT WORKS:
 * 1. multer library processes incoming files
 * 2. Files are saved temporarily in 'uploads/' folder
 * 3. Only PDF and DOCX files are allowed
 * 4. Maximum file size is 5MB
 * 
 * WHO SHOULD TOUCH THIS FILE:
 * - Anyone can use it as is (no changes needed)
 * - Set up once, everyone uses it
 * 
 * WHICH ENDPOINT USES THIS:
 * - POST /api/analyses (when uploading CV file)
 */