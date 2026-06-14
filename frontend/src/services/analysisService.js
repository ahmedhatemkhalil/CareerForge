import api from "./api";

export const createAnalysis = async (cvId, jobId) => {
    const { data } = await api.post("/analysis", { cvId, jobId });
    return data;
};
