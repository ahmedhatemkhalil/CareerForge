/**
 * AUTHENTICATION MIDDLEWARE
 * =========================
 * 
 * PURPOSE:
 * This file protects routes that require user to be logged in.
 * It verifies the JWT token sent in the request header.
 * 
 * HOW IT WORKS:
 * 1. Extracts the token from Authorization header
 * 2. Verifies the token using JWT_SECRET
 * 3. Extracts userId from the token
 * 4. Attaches userId to the request object
 * 5. Passes control to the next function (the controller)
 * 
 * WHO SHOULD TOUCH THIS FILE:
 * - Amany (since it's related to authentication)
 * 
 * WHICH ROUTES USE THIS:
 * - All protected routes (GET /api/users/me, POST /api/analyses, etc.)
 * 
 * HOW TO USE IN ROUTES:
 * -------------------------------------------------
 * router.get('/profile', auth, controller.getProfile);
 *                           ↑
 *                      This middleware runs first
 * -------------------------------------------------
 */
import jwt from "jsonwebtoken";

// export  const verifyToken = (req, res, next) => {

//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json("No token");
//   }

//   const token = authHeader.split(" ")[1];

//   try {

//     const decoded = jwt.verify(token, "secret");

//     req.user = decoded;

//     next();

//   } catch (err) {
//     res.status(401).json("Invalid token");
//   }
// };

 export const verifyToken = (req, res, next) => {
    
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ error: 'Please authenticate.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).send({ error: 'Invalid token' });
    }
};