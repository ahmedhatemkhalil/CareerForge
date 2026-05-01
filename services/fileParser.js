/**
 * FILE PARSER SERVICE
 * ===================
 * 
 * PURPOSE:
 * This file extracts plain text from uploaded PDF and DOCX files.
 * The extracted text is sent to Gemini AI for analysis.
 * 
 * HOW IT WORKS:
 * 1. Reads the uploaded file from disk
 * 2. For PDF: uses pdf-parse library
 * 3. For DOCX: uses mammoth library
 * 4. Returns plain text for AI to analyze
 * 
 * WHO SHOULD TOUCH THIS FILE:
 * - Hager (for CV analysis feature)
 * - Anyone else can also use it
 * 
 * WHICH ENDPOINT USES THIS:
 * - POST /api/analyses (extracts text from uploaded CV)
 */