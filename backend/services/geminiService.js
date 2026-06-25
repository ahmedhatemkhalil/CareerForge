import axios from 'axios'; 
import crypto from 'crypto';
import { JobDescription } from '../models/jobDescription/JobDescription.js'; 

const sleep = (ms) => new Promise(res => setTimeout(res, ms));
const fetchRealJobsFromSerper = async (optimizedTitle, fallbackTitle) => {
    const searchTitle = optimizedTitle || fallbackTitle || "Full-Stack Developer";
    const exclusions = "-instructor -senior -manager -owner -junior -head -lead -principal";
    
    
    const targetSites = "(site:linkedin.com/jobs AND site:wuzzuf.net AND site:indeed.com AND site:eg.tanqeeb.com)";
    const primaryQuery = `"${searchTitle}" ${targetSites} ${exclusions}`;

    const makeSearchRequest = async (query) => {
        const response = await axios.post('https://google.serper.dev/search', {
            q: query,
            num: 4, 
            tbs: "qdr:w" 
        }, {
            headers: { 
                'Content-Type': 'application/json', 
                'X-API-KEY': process.env.SERPER_API_KEY 
            }
        });

        if (response.data.organic && response.data.organic.length > 0) {
            return response.data.organic.map(job => ({
                title: job.title.replace(/ - .*/, ''), 
                company: job.snippet ? job.snippet.split('-')[0].trim() : "Verified Employer",
                url: job.link
            }));
        }
        return [];
    };

    try {
        console.log(` [Primary Search] Hunting on Big Platforms: ${primaryQuery}`);
    
        let jobs = await makeSearchRequest(primaryQuery);

     
        if (jobs.length === 0) {
            console.log(` No jobs found on big platforms. Switching to Fallback Strategy (Global Search)...`);
            
          
            const fallbackQuery = `"${searchTitle}" jobs in Egypt ${exclusions}`;
            console.log(` [Fallback Search] Hunting everywhere: ${fallbackQuery}`);
            
            jobs = await makeSearchRequest(fallbackQuery);
        }

        return jobs;

    } catch (err) {
        console.error("❌ Serper Search API Error:", err.message);
        return [];
    }
};

const parseImprovedSuggestions = (suggestionsArray) => {
    if (!Array.isArray(suggestionsArray)) return [];
    return suggestionsArray.map(item => {
        if (typeof item === 'string' && item.includes(' -> ')) {
            const parts = item.split(' -> ');
            return { 
                original: parts[0].replace(/^Original:\s*/i, '').trim(), 
                improved: parts[1].replace(/^Improved:\s*/i, '').trim() 
            };
        }
        return typeof item === 'object' ? item : { original: String(item), improved: "" };
    });
};

async function callLangflowAI(cvText, jobDescription, retries = 3) {
    const sanitize = (str) => (str ? str.replace(/[^\x00-\x7F]/g, "").trim() : "");
    const combinedInput = `Job Description: ${sanitize(jobDescription)}\n\nCandidate CV Text: ${sanitize(cvText).substring(0, 3500)}`;

    const urlFromEnv = process.env.LANGFLOW_URL || "http://127.0.0.1:7860";
    const cleanUrl = urlFromEnv.replace("localhost", "127.0.0.1");
    const flowId = process.env.LANGFLOW_FLOW_ID;
    const dynamicApiUrl = `${cleanUrl}/api/v1/run/${flowId}?stream=false`;

    const requestBody = {
        input_value: combinedInput,
        input_type: "chat",   
        output_type: "chat",
        session_id: crypto.randomUUID()
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const headers = { "Content-Type": "application/json" };
            
            if (process.env.LANGFLOW_API_KEY) {
                headers["x-api-key"] = process.env.LANGFLOW_API_KEY;
            }

            console.log(`🚀 Sending attempt ${attempt} to Langflow at: ${dynamicApiUrl}`);
            const response = await axios.post(dynamicApiUrl, requestBody, { headers, timeout: 60000 });

            if (response.status === 200) {
                const outputs = response.data.outputs?.[0]?.outputs?.[0];
                let rawText = outputs?.results?.message?.text || outputs?.outputs?.message?.text || JSON.stringify(response.data);
                
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) return JSON.parse(jsonMatch[0]);
            }
        } catch (err) {
            console.error(`⚠️ Langflow Attempt ${attempt} failed: ${err.message}`);
            if (attempt < retries) await sleep(5000 * attempt);
        }
    }
    throw new Error("❌ Langflow Communication Failed after all retries.");
}

export const processAIAnalysisSync = async (cvText, jobId) => {
    try {
        const jobData = await JobDescription.findById(jobId);
        if (!jobData) {
            throw new Error("Job Description not found in Database");
        }

        const jobText = jobData.description || jobData.descriptionText || "General Analysis";
        const jobTitleFromDb = jobData.title; 

        const aiAnalysis = await callLangflowAI(cvText, jobText);
        const realJobs = await fetchRealJobsFromSerper(aiAnalysis.jobTitleForSearch, jobTitleFromDb);

        return {
            matchScore: aiAnalysis.atsScore || aiAnalysis.matchScore || 0,
            strengths: aiAnalysis.strengths || [],
            weaknesses: aiAnalysis.weaknesses || [],
            skillGaps: aiAnalysis.missingSkills || aiAnalysis.skillGaps || [],
            recommendedActions: aiAnalysis.recommendedActions || [],
            improvedSuggestions: parseImprovedSuggestions(aiAnalysis.improvedSuggestions),
            matchedJobs: realJobs
        };
    } catch (error) {
        console.error("❌ Final Service Process Error:", error.message);
        throw error;
    }
};