/**
 * AUTHENTICATION CONTROLLER
 * =========================
 * 
 * PURPOSE:
 * This file contains the actual logic for authentication endpoints.
 * It handles signup, login, profile management, and account deletion.
 * 
 * ASSIGNED TO: AMANY
 * 
 * WHAT EACH FUNCTION DOES:
 * -------------------------------------------------
 * | Function        | Purpose                              |
 * |-----------------|--------------------------------------|
 * | signup          | Creates new user + returns JWT token |
 * | login           | Authenticates user + returns JWT token|
 * | getProfile      | Returns logged-in user's data         |
 * | updateProfile   | Updates user's name/email/preferences |
 * | changePassword  | Updates user's password               |
 * | deleteAccount   | Deletes user + all related data       |
 * -------------------------------------------------
 * 
 * RELATED FILES:
 * - models/User.js (database operations)
 * - routes/auth.js (endpoint definitions)
 * - middleware/auth.js (authentication)
 */