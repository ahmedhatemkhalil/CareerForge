import { Analysis } from '../models/Analysis.js';
import { extractTextFromFile } from './fileParser.js';
import cloudinary from '../config/cloudinary.js'; 
import fs from 'fs'; 

const API_KEY = process.env.GEMINI_API_KEY; 
// الحفاظ على الموديل الخاص بك كما هو
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`;

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// دالة مساعدة لمسح الملف من كلاوديناري
export const deleteFromCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl || !fileUrl.includes('cloudinary')) return;
        
        // استخراج الـ public_id (careerforge/cvs/filename)
        const parts = fileUrl.split('/');
        const folderIndex = parts.indexOf('careerforge');
        const publicIdWithExtension = parts.slice(folderIndex).join('/');
        const publicId = publicIdWithExtension.split('.')[0];
        
        await cloudinary.uploader.destroy(publicId);
        console.log("🗑️ Cloudinary file deleted:", publicId);
    } catch (error) {
        console.warn("⚠️ Cloudinary Delete Error:", error.message);
    }
};

export const processAIAnalysis = async (userId, filePath, jobDescription, retries = 3) => {
    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto', 
            folder: 'careerforge/cvs',
            use_filename: true,   
            unique_filename: true
        });
        
        const cvUrl = uploadResult.secure_url; 
        const extractedText = await extractTextFromFile(filePath);
        
        // استدعاء التحليل (الآن يشمل الـ ATS Score ديناميكياً)
        const aiAnalysis = await callGeminiAI(extractedText, jobDescription, retries);

        const newAnalysis = new Analysis({
            userId,
            cvFileUrl: cvUrl, 
            cvText: extractedText,
            jobDescription: jobDescription || "General Analysis",
            ...aiAnalysis 
        });

        return await newAnalysis.save();

    } catch (error) {
        console.error("❌ Process Analysis Error:", error.message);
        throw new Error(error.message);
    } finally {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

export const reProcessAIAnalysis = async (analysisId, existingText, newJobDescription) => {
    try {
        const aiAnalysis = await callGeminiAI(existingText, newJobDescription);
        
        return await Analysis.findByIdAndUpdate(
            analysisId,
            { 
                jobDescription: newJobDescription, 
                ...aiAnalysis  
            },
            { new: true, runValidators: true }
        );
    } catch (error) {
        throw new Error(`Re-analysis Failed: ${error.message}`);
    }
};

async function callGeminiAI(cvText, jobDescription, retries = 3) {
    const prompt = `
    Task: Act as an expert HR Recruiter and ATS (Applicant Tracking System). 
    Analyze the provided CV text against the Target Job Description.
    
    CV Content: ${cvText}
    Target Job: ${jobDescription}

    Output Requirements (JSON ONLY):
    {
      "atsScore": 0,
      "strengths": ["4 specific professional strengths found in the CV"],
      "weaknesses": ["3-5 concrete areas for improvement relative to the target job"],
      "missingSkills": ["Hard skills or tools mentioned in the job description that are absent in the CV"],
      "recommendedActions": ["Clear, actionable steps to make this CV more competitive"],
      "matchedJobs": [
        "Job Title - Platform: Search Link"
      ]
    }
    
    Instructions:
    1. atsScore: Calculate a REALISTIC match percentage (0-100) based on how well the CV fits the Job Description. DO NOT use a static number.
    2. matchedJobs: Provide 3-5 job search links from platforms like LinkedIn, Wuzzuf, and Indeed. Format each as: "Title - Platform: Link".
    3. Return ONLY valid JSON.`;

    let attempt = 0;
    while (attempt < retries) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { 
                        responseMimeType: "application/json",
                        temperature: 0.7 
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                const rawText = data.candidates[0].content.parts[0].text;
                return JSON.parse(rawText);
            }

            if (response.status === 429 || response.status === 503) {
                attempt++;
                await sleep(2000 * attempt);
                continue;
            }

            throw new Error(data.error?.message || "Failed to communicate with Gemini");
        } catch (err) {
            if (attempt >= retries - 1) throw err;
            attempt++;
        }
    }
}