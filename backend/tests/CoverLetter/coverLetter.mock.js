// tests/CoverLetter/coverLetter.mock.js

export const mockCoverLetterInput = (analysisId) => ({
    analysisId: analysisId,
    companyName: "CareerForge Tech",
    jobTitle: "MERN Stack Developer",
    hrName: "Bashmohandes Ahmed",
    templateType: "creative"
});

export const mockCreativeTemplateExpectation = {
    subject: "Quick Question regarding MERN Stack Developer role",
    bodyHas: "clean code meets modern user experiences"
};

export const mockTechnicalTemplateExpectation = {
    subject: "Technical Profile: Application for MERN Stack Developer",
    bodyHas: "computational and full-stack strengths"
};