/**
 * INTERVIEW ROUTES
 * ================
 * 
 * PURPOSE:
 * This file defines all API endpoints for mock interviews.
 * It maps URLs to controller functions.
 * 
 * ASSIGNED TO: Elaf
 * 

 * INTERVIEW FLOW:
 * 1. POST /interviews → get first question
 * 2. POST /interviews/{id}/answer (repeat 5 times)
 * 3. POST /interviews/{id}/complete → get summary
 * 
 * NOTES:
 * - All routes require authentication (auth middleware)
 * - The {id} in URL is a placeholder (replace with actual interview ID)
 */