// tests/subscription/plan.mock.js

export const mockNewPlanInput = {
    name: "Enterprise",
    limits: {
        analysesPerMonth: 500,
        interviewsPerMonth: 250,
        roadmapsPerMonth: 200
    }
};

export const mockUpdatePlanInput = {
    limits: {
        analysesPerMonth: 60,
        interviewsPerMonth: 40,
        roadmapsPerMonth: 30
    }
};