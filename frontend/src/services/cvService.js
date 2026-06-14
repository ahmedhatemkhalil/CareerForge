import api from "./api";

export const getMyCVs = async () => {
    const { data } = await api.get("/cvs");
    return data.data.cvs;
};

export const getCVById = async (cvId) => {
    const { data } = await api.get(`/cvs/${cvId}`);
    return data.data;
};

export const setActiveCV = async (cvId) => {
    const { data } = await api.patch(`/cvs/${cvId}/set-active`);
    return data;
};