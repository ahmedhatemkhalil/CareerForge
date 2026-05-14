const QUESTIONS = {
    frontend: [
        "Tell me about yourself and your frontend development experience.",
        "Can you explain the difference between var, let, and const in JavaScript?",
        "How do you manage component state in React? When do you use local state vs global state?",
        "What is the virtual DOM and how does it improve performance?",
        "How do you handle API calls and async operations in your frontend projects?",
        "Describe a performance issue you faced in a frontend project and how you solved it.",
        "How do you ensure your web applications are accessible (a11y)?",
        "What is your approach to responsive design and cross-browser compatibility?",
    ],
    backend: [
        "Tell me about yourself and your backend development experience.",
        "How do you design a RESTful API? What are the key principles you follow?",
        "Explain how you handle authentication and authorization in your applications.",
        "How do you manage database relationships and when do you use SQL vs NoSQL?",
        "Describe how you handle errors and logging in production systems.",
        "How do you approach API versioning and backward compatibility?",
        "Describe a time you optimized a slow database query. What was your approach?",
        "How do you ensure the security of your backend APIs?",
    ],
    fullstack: [
        "Tell me about yourself and your full-stack experience.",
        "How do you decide when to put logic on the frontend vs the backend?",
        "Describe your experience with databases — SQL vs NoSQL, when do you use each?",
        "How do you handle authentication across frontend and backend?",
        "Tell me about a full-stack project you built from scratch. What did you learn?",
        "How do you manage state between your frontend and backend?",
        "How do you manage deployment and CI/CD in your projects?",
        "How do you handle real-time features like notifications or live updates?",
    ],
    default: [
        "Tell me about yourself and your professional background.",
        "What are your greatest strengths and how do they apply to this role?",
        "Describe a challenging situation at work and how you handled it.",
        "Tell me about a time you worked in a team under pressure. What was your role?",
        "How do you prioritize tasks when you have multiple deadlines?",
        "Describe a time you had a conflict with a colleague. How did you resolve it?",
        "What do you consider your biggest professional achievement so far?",
        "Where do you see yourself in the next 3-5 years?",
    ],
};

const FEEDBACK_POOL = [
    {
        feedback:
        "Good answer! You communicated your points clearly. Try to add more specific examples with measurable outcomes next time.",
        score: 7,
    },
    {
        feedback:
        "Solid response with good structure. Consider using the STAR method (Situation, Task, Action, Result) to make your answers more impactful.",
        score: 8,
    },
    {
        feedback:
        "You covered the basics well. Expand more on the technical details and your specific role in the project to stand out.",
        score: 6,
    },
    {
        feedback:
        "Great answer! You demonstrated strong problem-solving skills. Keep quantifying your achievements with numbers and metrics.",
        score: 9,
    },
    {
        feedback:
        "Decent response. Try to be more concise and focused — aim to answer in 2-3 minutes max without losing key details.",
        score: 7,
    },
    {
        feedback:
        "You showed good understanding of the concept. Next time, back it up with a real example from your experience to make it more convincing.",
        score: 7,
    },
    {
        feedback:
        "Strong answer with clear structure. To take it further, mention the impact your actions had on the team or project outcome.",
        score: 8,
    },
    {
        feedback:
        "Good start, but the answer was a bit vague. Be more specific about the tools, technologies, or methods you used.",
        score: 6,
    },
];


const detectCategory = (jobDescription) => {
    const desc = jobDescription.toLowerCase();
    if (desc.includes("fullstack") || desc.includes("full-stack") || desc.includes("full stack")) {
        return "fullstack";
    }
    if (desc.includes("frontend") || desc.includes("react") || desc.includes("vue") || desc.includes("angular") || desc.includes("css") || desc.includes("html")) {
        return "frontend";
    }
    if (desc.includes("backend") || desc.includes("node") || desc.includes("python") || desc.includes("java") || desc.includes("django") || desc.includes("express")) {
        return "backend";
    }
    return "default";
};


export const generateFirstQuestion = async (jobDescription) => {
    const category = detectCategory(jobDescription);
    return QUESTIONS[category][0];
};

//  Evaluate answer + get next question
//  Input:  { jobDescription, question, userAnswer, questionNumber, totalQuestions }
//  Output: { feedback, score, nextQuestion }
export const evaluateAnswerAndGetNext = async ({
    jobDescription,
    questionNumber,
}) => {
    const category = detectCategory(jobDescription);
    const questions = QUESTIONS[category];

    const feedbackItem = FEEDBACK_POOL[Math.floor(Math.random() * FEEDBACK_POOL.length)];

    const isLastQuestion =
        questionNumber >= 8;

        const nextQuestion =
        !isLastQuestion
            ? questions[questionNumber]
            : null;

    return {
        feedback:     feedbackItem.feedback,
        score:        feedbackItem.score,
        nextQuestion,
    };    
};


// final summary report
// Input:  { jobDescription, qaList }
// Output: { overallScore, generalFeedback, tipsForImprovement }
export const generateSummaryReport = async ({ qaList }) => {
    const scores = qaList.map((q) => q.score ?? 7);
    const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;
    const overallScore = Math.round(avg * 10) / 10;

    return {
        overallScore,
        generalFeedback: `You completed the mock interview with an overall score of ${overallScore}/10. You demonstrated good communication skills and a solid understanding of the role. Focus on providing more concrete examples from your past experience and quantify your achievements where possible. Keep practicing and you'll be well-prepared for your real interview!`,
        tipsForImprovement: [
        "Use the STAR method (Situation, Task, Action, Result) for every behavioral question.",
        "Quantify your achievements with numbers and metrics wherever possible.",
        "Research the company before the interview and tailor your answers to their values.",
        "Practice speaking for 2-3 minutes per answer — not too short, not too long.",
        "Prepare 2-3 questions to ask the interviewer at the end of the session.",
        ],
    };
};