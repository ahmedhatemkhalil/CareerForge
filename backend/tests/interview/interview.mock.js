export const mockStartInterviewResponse = {
    isCompleted: false,
    nextQuestion: "Tell me about yourself",
    feedback: null,
    score: null,
};

export const mockContinueInterviewResponse = {
    isCompleted: false,
    nextQuestion: "What is React?",
    feedback: "Good Answer",
    score: 9,
};

export const mockFinishInterviewResponse = {
    isCompleted: true,
    score: 9,
    feedback: "Good Answer",
    overallScore: 90,
    generalFeedback: "Excellent performance",
    hiringRecommendation: "Hire",
    tipsForImprovement: ["Learn Docker"],
};