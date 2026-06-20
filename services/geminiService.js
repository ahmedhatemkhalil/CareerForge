/**
 * GEMINI AI SERVICE
 * =================
 * 
 * PURPOSE:
 * This file handles all interactions with Google's Gemini AI.
 * It contains functions to analyze CVs, generate interview questions,
 * score answers, and create roadmaps.
 * 
 * HOW IT WORKS:
 * 1. Creates a Gemini AI client using API key from .env
 * 2. Sends prompts with CV text, job descriptions, etc.
 * 3. Receives AI-generated responses
 * 4. Returns structured data to controllers
 * 
 * WHO SHOULD TOUCH THIS FILE:
 * - Everyone (collaborate on this file)
 * - Each member adds their own AI functions
 * 
 * WHAT EACH MEMBER SHOULD ADD:
 * - Amany: None (auth doesn't need AI)
 * - Hager: analyzeCV() function
 * - Elaf: generateQuestion(), scoreAnswer(), generateSummary() functions
 * - Ahmed: generateRoadmap() function
 * 
 * API KEY NEEDED:
 * - Each member must have GEMINI_API_KEY in their .env file
 */