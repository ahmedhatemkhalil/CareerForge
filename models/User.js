/**
 * USER MODEL (TABLE)
 * ==================
 * 
 * PURPOSE:
 * This file defines the structure of the 'users' table in MongoDB.
 * It stores all user account information.
 * 
 * ASSIGNED TO: AMANY
 * 
 
 * WHAT YOU NEED TO IMPLEMENT:
 * 1. Define the schema with all fields above
 * 2. Add password hashing before saving (bcrypt)
 * 3. Add method to compare passwords for login
 * 
 * RELATED FILES:
 * - routes/auth.js (uses this model)
 * - controllers/authController.js (uses this model)
 */
import mongoose from "mongoose";

const userSchema = new mongoose.Schema( {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },

    verifyToken: String,
    verificationExpire: Date,
    resetPasswordToken: String,
  resetPasswordExpire: Date
  },
  { timestamps: true });

export default mongoose.model("User", userSchema);
