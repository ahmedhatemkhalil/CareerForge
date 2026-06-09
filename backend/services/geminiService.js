import { Analysis } from '../models/Analysis.js';
import { extractTextFromFile } from './fileParser.js';
import cloudinary from '../config/cloudinary.js'; 
import fs from 'fs'; 
import axios from 'axios'; 
import crypto from 'crypto'; 

const LANGFLOW_URL = process.env.LANGFLOW_URL;
const FLOW_ID = process.env.LANGFLOW_FLOW_ID;
const API_URL = `${LANGFLOW_URL}/api/v1/run/${FLOW_ID}?stream=false`;

const sleep = (ms) => new Promise(res => setTimeout(res, ms));
const fetchRealJobsFromSerper = async (optimizedTitle, targetJob) => {
    const searchTitle = targetJob || optimizedTitle || "Frontend Developer";
    
    const exclusions = "-instructor -senior -manager -owner -junior -head -lead -principal";
    
    const keywords = (targetJob || searchTitle).toLowerCase().split(/[\s,]+/);

    // 4. تنفيذ البحث
    const searchQuery = `"${searchTitle}" jobs in Egypt ${exclusions}`;

    try {
        const response = await axios.post('https://google.serper.dev/search', {
            q: searchQuery,
            num: 10, 
            tbs: "qdr:m"
        }, {
            headers: { 'Content-Type': 'application/json', 'X-API-KEY': process.env.SERPER_API_KEY }
        });

        let allJobs = [];
        if (response.data.organic) {
            allJobs = response.data.organic
                .map(job => ({
                    title: job.title,
                    company: job.snippet ? job.snippet.split('-')[0].trim() : "Unknown",
                    url: job.link
                }))
                .filter(job => {
                    const titleLower = job.title.toLowerCase();
                    return keywords.some(word => titleLower.includes(word));
                });
        }

        if (allJobs.length === 0 && response.data.organic?.length > 0) {
            return response.data.organic.slice(0, 3).map(job => ({
                title: job.title,
                company: job.snippet ? job.snippet.split('-')[0].trim() : "Unknown",
                url: job.link
            }));
        }

        return allJobs.slice(0, 6); // نرجع أول 6 وظائف فقط

    } catch (err) {
        console.error("❌ Search API Error:", err.message);
        return [];
    }
};

const parseImprovedSuggestions = (suggestionsArray) => {
    if (!Array.isArray(suggestionsArray)) return [];
    return suggestionsArray.map(item => {
        if (typeof item === 'string' && item.includes(' -> ')) {
            const parts = item.split(' -> ');
            return { original: parts[0].replace(/^Original:\s*/i, '').trim(), improved: parts[1].replace(/^Improved:\s*/i, '').trim() };
        }
        return typeof item === 'object' ? item : { original: String(item), improved: "" };
    });
};

async function callLangflowAI(cvText, jobDescription, retries = 3) {
    const sanitize = (str) => (str ? str.replace(/[^\x00-\x7F]/g, "").trim() : "");
    const combinedInput = `Job: ${sanitize(jobDescription || "General Analysis")}\nCV: ${sanitize(cvText).substring(0, 3500)}`;

    const requestBody = {
        input_value: combinedInput,
        input_type: "text",
        output_type: "chat",
        session_id: crypto.randomUUID()
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const headers = { "Content-Type": "application/json" };
            if (process.env.LANGFLOW_API_KEY) headers["x-api-key"] = process.env.LANGFLOW_API_KEY;

            const response = await axios.post(API_URL, requestBody, { headers, timeout: 20000 });

            if (response.status === 200) {
                const outputs = response.data.outputs?.[0]?.outputs?.[0];
                let rawText = outputs?.results?.message?.text || outputs?.outputs?.message?.text || JSON.stringify(response.data);
                
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) return JSON.parse(jsonMatch[0]);
            }
        } catch (err) {
            console.error(`Attempt ${attempt} failed: ${err.message}`);
            if ((err.response?.status === 429 || err.response?.status === 503) && attempt < retries) {
                await sleep(10000 * attempt); 
                continue;
            }
        }
    }
    throw new Error("Langflow Communication Failed after retries.");
}

export const processAIAnalysis = async (userId, filePath, jobDescription, retries = 3) => {
    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'auto', folder: 'careerforge/cvs' });
        const extractedText = await extractTextFromFile(filePath);
        const aiAnalysis = await callLangflowAI(extractedText, jobDescription, retries);
        const realJobs = await fetchRealJobsFromSerper(aiAnalysis.jobTitleForSearch, jobDescription); 

        const newAnalysis = new Analysis({
            userId, cvFileUrl: uploadResult.secure_url, cvText: extractedText,
            jobDescription: jobDescription || "General Analysis",
            atsScore: aiAnalysis.atsScore || 0,
            strengths: aiAnalysis.strengths || [],
            weaknesses: aiAnalysis.weaknesses || [],
            missingSkills: aiAnalysis.missingSkills || [],
            recommendedActions: aiAnalysis.recommendedActions || [],
            improvedSuggestions: parseImprovedSuggestions(aiAnalysis.improvedSuggestions),
            matchedJobs: realJobs 
        });
        return await newAnalysis.save();
    } catch (error) {
        console.error("❌ Final Process Error:", error.message);
        throw error;
    } finally {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
};

export const reProcessAIAnalysis = async (analysisId, existingText, newJobDescription) => {
    const aiAnalysis = await callLangflowAI(existingText, newJobDescription);
    const realJobs = await fetchRealJobsFromSerper(aiAnalysis.jobTitleForSearch, newJobDescription); 
    return await Analysis.findByIdAndUpdate(analysisId, {
        jobDescription: newJobDescription,
        atsScore: aiAnalysis.atsScore || 0,
        strengths: aiAnalysis.strengths || [],
        weaknesses: aiAnalysis.weaknesses || [],
        missingSkills: aiAnalysis.missingSkills || [],
        recommendedActions: aiAnalysis.recommendedActions || [],
        improvedSuggestions: parseImprovedSuggestions(aiAnalysis.improvedSuggestions),
        matchedJobs: realJobs
    }, { new: true });
};