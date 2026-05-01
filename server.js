const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'CareerForge API is running!' });
});

// Import routes (will add later)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/analyses', require('./routes/analyses'));
// app.use('/api/interviews', require('./routes/interviews'));
// app.use('/api/roadmaps', require('./routes/roadmaps'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});