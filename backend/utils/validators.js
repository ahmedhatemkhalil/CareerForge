// /**
//  * VALIDATION UTILITIES
//  * ====================
//  * 
//  * PURPOSE:
//  * This file contains reusable validation functions.
//  * Used across multiple controllers to validate user input.
//  * 
//  * WHO SHOULD TOUCH THIS FILE:
//  * - Anyone (add validation functions as needed)
//  * 
//  * COMMON USAGES:
//  * - Validate email format before signup
//  * - Check password strength
//  * - Validate name length
//  */

// // ================= EMAIL VALIDATION =================
/**
 * ================= EMAIL VALIDATION =================
 * Accepts real email format and ensures it ends with .com
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
   const allowedDomains = ["gmail.com", "yahoo.com", "test.com"];
   if (!email || typeof email !== "string") return false;

 
  if (!emailRegex.test(email)) return false;

   const domain = email.split("@")[1].toLowerCase();


  return allowedDomains.includes(domain);
};

/**
 * ================= PASSWORD VALIDATION =================
 * Strong password rules:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (@, #, $, etc.)
 */
export const isStrongPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;

  return passwordRegex.test(password);
};

/**
 * ================= NAME VALIDATION (optional but useful) =================
 * Only letters and spaces
 */
export const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name);
};
// ================= PASSWORD MATCH =================
export const passwordsMatch = (
  password,
  confirmPassword
) => {

  return password === confirmPassword;

};

// /**
//  * VALIDATION UTILITIES
//  * ====================
//  * 
//  * PURPOSE:
//  * This file contains reusable validation functions.
//  * Used across multiple controllers to validate user input.
//  * 
//  * WHO SHOULD TOUCH THIS FILE:
//  * - Anyone (add validation functions as needed)
//  * 
//  * COMMON USAGES:
//  * - Validate email format before signup
//  * - Check password strength
//  * - Validate name length
//  */

// // utils/appError.js
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; 
    Error.captureStackTrace(this, this.constructor);
  }
}

// utils/catchAsync.js
// export const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next); 
//   };
// };
export const catchAsync = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch(next);
  };
};