import api from "./api";

export const createJobDescription = async (payload) => {
    const { data } = await api.post("/job-descriptions", payload);
    return data.data;
};

export const getMyJobDescriptions = async () => {
    const { data } = await api.get("/job-descriptions");
    return data.data;
};