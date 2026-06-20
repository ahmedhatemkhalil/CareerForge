/**
 * INTERVIEW CONTROLLER
 * ====================
 * 
 * PURPOSE:
 * This file contains the logic for mock interview endpoints.
 * It handles starting interviews, submitting answers, and completing sessions.
 * 
 * ASSIGNED TO: Eilaf
 * 

 * INTERVIEW FLOW:
 * 1. startInterview → gets first question
 * 2. submitAnswer (repeat for each question) → gets score + feedback + next question
 * 3. completeInterview → calculates average score + generates summary tips
 * 
 * RELATED FILES:
 * - models/Interview.js (database operations)
 * - routes/interviews.js (endpoint definitions)
 * - services/geminiService.js (AI questions, scoring, summary)
 * - middleware/auth.js (authentication)
 */