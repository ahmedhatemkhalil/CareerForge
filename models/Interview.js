/**
 * INTERVIEW MODEL (TABLE)
 * =======================
 * 
 * PURPOSE:
 * This file defines the structure of the 'interviews' table in MongoDB.
 * It stores all mock interview sessions and their Q&A pairs.
 * 
 * ASSIGNED TO: Eilaf
 * 
 
 * WHAT YOU NEED TO IMPLEMENT:
 * 1. Define the main schema with all fields above
 * 2. Create nested schema for questionsAndAnswers
 * 3. Add pre-save middleware to auto-calculate averageScore
 * 4. Add index for userId to speed up queries
 * 
 * RELATED FILES:
 * - routes/interviews.js (uses this model)
 * - controllers/interviewController.js (uses this model)
 */