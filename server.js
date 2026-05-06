import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import authRoutes from "./Modules/Auth/auth.route.js";
import userRoutes from "./Modules/User/userRoutes.js";
import sendEmail from "./Email/email.js";
// Load environment variables

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Use the model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users",userRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'CareerForge API is running!' });
});

// Import routes (will add later)
// import authRoutes from './Modules/Auth/auth.route.js';
// app.use('/api/auth', authRoutes);
// import analysesRoutes from './Modules/Analysis/analyses.routes.js';
// app.use('/api/analyses', analysesRoutes);
// import interviewsRoutes from './Modules/Interview/interviews.routes.js';
// app.use('/api/interviews', interviewsRoutes);
// import roadmapsRoutes from './Modules/Roadmap/roadmaps..routes.js';
// app.use('/api/roadmaps', roadmapsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});