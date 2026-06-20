import axios from "axios";
import crypto from "crypto";
import { enrichResourcesWithRag } from "./ragService.js";

const langflowBaseUrl = (process.env.LANGFLOW_URL || "http://127.0.0.1:7860").replace(
    "localhost",
    "127.0.0.1"
);
const flowId = process.env.LANGFLOW_ROADMAP_FLOW_ID;
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;
const LANGFLOW_ROADMAP_PROMPT_ID = process.env.LANGFLOW_ROADMAP_PROMPT_ID;

const RESOURCE_TYPES = new Set(["video", "article", "course", "documentation", "book"]);

const toArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const parseAIResponse = (text) => {
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) {
            return null;
        }

        try {
            return JSON.parse(match[0]);
        } catch {
            return null;
        }
    }
};

const normalizeResource = (resource) => {
    if (!resource?.title) {
        return null;
    }

    const type = String(resource.type || "article").toLowerCase();

    return {
        title: String(resource.title).trim(),
        url: resource.url ? String(resource.url).trim() : "",
        type: RESOURCE_TYPES.has(type) ? type : "article",
        platform: String(resource.platform || "").trim(),
        isFree: resource.isFree ?? resource.is_free ?? true,
        searchTopic: String(resource.searchTopic || resource.search_topic || resource.title).trim(),
    };
};

const normalizeWeek = (week, index) => ({
    weekNumber: Number(week.weekNumber ?? week.week_number ?? index + 1),
    theme: String(week.theme || week.focus || "").trim(),
    description: String(week.description || "").trim(),
    completed: false,
    completedAt: null,
    resources: toArray(week.resources).map(normalizeResource).filter(Boolean),
});

const normalizeRoadmapPlan = (parsed) => {
    const weeks = toArray(parsed.weeks).map(normalizeWeek).filter((week) => week.theme);

    if (weeks.length === 0) {
        return null;
    }

    return {
        weeks,
        aiTokensUsed: Number(parsed.tokensUsed ?? parsed.ai_tokens_used ?? 0) || 0,
    };
};

const buildRoadmapContext = ({
    currentRole,
    targetRole,
    hoursPerWeek,
    skillGaps,
    weaknesses,
    strengths,
    recommendedActions,
    matchScore,
    jobDescription,
    jobTitle,
}) => `
You are generating a career learning roadmap.

Job title: ${jobTitle || "Not specified"}
Current role: ${currentRole || "Not specified"}
Target role: ${targetRole || jobTitle || "Not specified"}
Hours per week available: ${hoursPerWeek}
Match score: ${matchScore ?? "N/A"}% (how well the CV matched the job; lower score = bigger gap, plan should be more comprehensive)

Missing skills (priority focus):
${toArray(skillGaps).join(", ") || "None provided"}

Negative points / weaknesses to improve:
${toArray(weaknesses).join(", ") || "None provided"}

Strengths to build on:
${toArray(strengths).join(", ") || "None provided"}

Recommended actions from analysis:
${toArray(recommendedActions).join(", ") || "None provided"}

Job description:
${jobDescription || "Not provided"}

Instructions:
- Build the roadmap primarily around the missing skills and weaknesses above.
- CRITICAL: Personalize every week to the exact Current role and Target role above. If skill gaps say "None provided", infer the learning path from the role transition only.
- Do NOT return a generic React/frontend roadmap unless the target role is clearly frontend-related (e.g. React Developer, Frontend Engineer).
- Use match score as intensity guidance: below 50% prioritize fundamentals and more weeks; 50-75% balance gaps with role-specific skills; above 75% focus on advanced polish and interview readiness.
- Adjust number of weeks based on hours per week (more hours = fewer weeks, fewer hours = more weeks).
- For each resource, DO NOT invent URLs. Provide title, type, platform, and searchTopic only.
- Prefer MaharaTech, Udemy, Coursera, YouTube, MDN, freeCodeCamp, W3Schools, or GeeksforGeeks when suggesting platform.
- Use type "video" for YouTube, "course" for MaharaTech/Udemy/Coursera, and "documentation" for MDN/React docs.
- Number of weeks: use roughly 1 week per major skill gap or weakness (minimum 4, maximum 12). More hours per week means fewer total weeks.
`.trim();

const callLangflowRoadmap = async (context) => {
    if (!flowId) {
        throw new Error("LANGFLOW_ROADMAP_FLOW_ID is not configured");
    }

    const apiUrl = `${langflowBaseUrl}/api/v1/run/${flowId}?stream=false`;
    const sessionId = crypto.randomUUID();

    const payload = {
        output_type: "chat",
        input_type: "chat",
        session_id: sessionId,
        input_value: context,
    };

    if (LANGFLOW_ROADMAP_PROMPT_ID) {
        payload.tweaks = {
            [LANGFLOW_ROADMAP_PROMPT_ID]: {
                roadmap_context: context,
            },
        };
    }

    const headers = { "Content-Type": "application/json" };
    if (LANGFLOW_API_KEY) {
        headers["x-api-key"] = LANGFLOW_API_KEY;
    }

    try {
        const response = await axios.post(apiUrl, payload, {
            headers,
            timeout: 120000,
        });

        const aiText =
            response.data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
            response.data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message;

        return parseAIResponse(aiText);
    } catch (error) {
        const status = error.response?.status;

        if (status === 404) {
            throw new Error(
                `Langflow flow not found. Open Langflow → your roadmap flow → API tab → copy Flow ID into LANGFLOW_ROADMAP_FLOW_ID in .env (current: ${flowId})`
            );
        }

        if (status === 403) {
            throw new Error("Langflow API key is invalid. Check LANGFLOW_API_KEY in .env");
        }

        if (status === 500) {
            const detail =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                JSON.stringify(error.response?.data) ||
                "Unknown Langflow error";
            throw new Error(
                `Langflow flow failed (500). Open the flow in Langflow → Playground → run it manually to see the error. Details: ${detail}`
            );
        }

        if (error.code === "ECONNREFUSED") {
            throw new Error("Langflow is not running. Start it at LANGFLOW_URL (default http://localhost:7860)");
        }

        throw error;
    }
};

export const generateRoadmapPlan = async (input) => {
    const {
        currentRole = "",
        targetRole = "",
        hoursPerWeek = 10,
        skillGaps = [],
        weaknesses = [],
        strengths = [],
        recommendedActions = [],
        matchScore = null,
        jobDescription = "",
        jobTitle = "",
    } = input;

    const context = buildRoadmapContext({
        currentRole,
        targetRole,
        hoursPerWeek,
        skillGaps,
        weaknesses,
        strengths,
        recommendedActions,
        matchScore,
        jobDescription,
        jobTitle,
    });

    const parsed = await callLangflowRoadmap(context);
    const normalized = parsed ? normalizeRoadmapPlan(parsed) : null;

    if (!normalized) {
        throw new Error("AI returned an invalid or empty roadmap");
    }

    const weeksWithRagResources = await enrichResourcesWithRag(normalized.weeks);

    if (weeksWithRagResources.length === 0) {
        throw new Error("AI returned a roadmap but no learning resources could be found");
    }

    return {
        weeks: weeksWithRagResources,
        aiTokensUsed: normalized.aiTokensUsed,
    };
};
