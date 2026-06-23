import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const langflowBaseUrl = process.env.LANGFLOW_URL || "http://localhost:7860";
const flowId = process.env.LANGFLOW_INTERVIEW_FLOW_ID || "a8fe870f-c60a-44fe-a69b-a08f1e10bbc6";
const LANGFLOW_API_URL = `${langflowBaseUrl}/api/v1/run/${flowId}`;
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;
const LANGFLOW_PROMPT_ID = process.env.LANGFLOW_PROMPT_ID;
// Helpers
const toArray = (val) => Array.isArray(val) ? val : val ? [val] : [];

const parseAIResponse = (text) => {
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return null;

        try {
            return JSON.parse(match[0]);
        } catch {
            return null;
        }
    }
};

// Core 
const sendToLangflow = async (inputs, isStart = false) => {
    try { 
        const historyText = isStart
          ? "Interview just started."
          : inputs.interviewHistory
            .map((item) => `Question: ${item.question}\nAnswer: ${item.answer}`)
            .join("\n\n");

        const candidateAnalysisString = `
          - Match Score: ${inputs.matchScore || 0}%
          - Strengths: ${toArray(inputs.strengths).join(", ")}
          - Weaknesses: ${toArray(inputs.weaknesses).join(", ")}
          - Skill Gaps: ${toArray(inputs.skillGaps).join(", ")}
        `;

        const payload = {
            output_type: "chat",
            input_type: "chat",
            session_id: inputs.langflowSessionId,
            input_value: isStart ? "start" : (inputs.candidateAnswer || ""), 
            tweaks: {
              "Prompt Template-rAOBc": {
                job_title: inputs.jobTitle || "",
                job_description: inputs.jobDescription || "",
                interview_history: historyText,
                candidate_analysis: candidateAnalysisString 
              },
            },
        };

        const response = await axios.post(LANGFLOW_API_URL, payload, {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": LANGFLOW_API_KEY,
            },
            timeout: 60000 
        });

        const aiText = response.data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text || response.data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message;

        if (!aiText) throw new Error("No AI text in response"); 

        const parsed = parseAIResponse(aiText);

        if (!parsed) throw new Error("Failed to parse AI response");

        return {
            isCompleted: parsed.isCompleted ?? false,
            score: parsed.score ?? null,
            feedback: parsed.feedback ?? null,
            nextQuestion: parsed.nextQuestion ?? null,
            overallScore: parsed.overall_score ?? parsed.overallScore ?? null,
            generalFeedback: parsed.overall_feedback ?? parsed.generalFeedback ?? null,
            tipsForImprovement: parsed.tips_for_improvement ?? parsed.tipsForImprovement ?? [],
            hiringRecommendation: parsed.hiringRecommendation ?? null,
        };

    } catch (error) { 
        console.error("Langflow Error Details:", error.response?.data || error.message);
        
        return {
            isCompleted: false,
            score: 0,
            feedback: "Error communicating with AI service. Please try again.",
            nextQuestion: null,
            error: true 
        };
    }
};

export const startInterviewAI = (payload) => sendToLangflow(payload, true);
export const continueInterviewAI = (payload) => sendToLangflow(payload, false);