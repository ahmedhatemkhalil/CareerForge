import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from "./Modules/Auth/auth.route.js";
import userRoutes from "./Modules/User/userRoutes.js";
import adminRoutes from "./Modules/User/adminRoutes.js";
import interviewRouter from './Modules/Interview/interviews.routes.js';
import forgotPasswordRoutes from './Modules/ForgotPassword/forgotPassword.routes.js';
import { AppError } from './utils/validators.js';
import { globalErrorHandler } from './Modules/Error/error.controller.js';
import roadmapsRoutes from "./Modules/Roadmap/roadmaps.routes.js";
import analysesRoutes from './Modules/Analysis/analyses.routes.js';
import oauthRoutes from './Modules/Oauth/oauthRoutes.js';
import cvRoutes from './Modules/CV/cv.routes.js'; 
import jobDescriptionRoutes from './Modules/jobDescription/job.routes.js'; 
import sendEmail from "./Email/email.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", forgotPasswordRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/interviews', interviewRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/roadmaps", roadmapsRoutes);
app.use('/api/analysis', analysesRoutes); 
app.use('/api', oauthRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'CareerForge API is running!' });
});

app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

console.log("Is globalErrorHandler a function?", typeof globalErrorHandler);
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});





















