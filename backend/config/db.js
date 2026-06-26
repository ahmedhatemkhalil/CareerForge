/**
 * DATABASE CONNECTION FILE
 * ========================
 * 
 * PURPOSE:
 * This file connects our Node.js application to MongoDB Atlas (cloud database).
 * It uses the connection string from the .env file.
 * 
 * HOW IT WORKS:
 * 1. Loads mongoose library (ODM for MongoDB)
 * 2. Reads MONGODB_URI from .env file
 * 3. Connects to the database
 * 4. Logs success or error message
 * 
 * WHO SHOULD TOUCH THIS FILE:
 * - Anyone can use it as is (no changes needed)
 * - Team Lead set it up once, everyone uses it
 * 
 * WHEN THIS FILE IS USED:
 * - Called once when server starts (from server.js)
 */


import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Some Windows/network setups fail SRV lookup with local DNS resolvers.
    // For Atlas (mongodb+srv), force reliable public resolvers as a fallback.
    // if (mongoUri.startsWith('mongodb+srv://')) {
    //   dns.setServers(['8.8.8.8', '1.1.1.1']);
    // }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;