import api from "./api";

export const createAnalysis = async (cvId, jobId) => {
    const { data } = await api.post("/analysis", { cvId, jobId });
    return data;
};

export const getAnalysisById = async (analysisId) => {
    const { data } = await api.get(`/analysis/${analysisId}`);
    return data.data;
};
