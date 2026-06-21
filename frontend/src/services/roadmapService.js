import api from "./api";

export const getAnalyses = () => api.get('/analysis');
export const postRoadmap = (data) => api.post('/roadmaps', data); 


export const getRoadmapById = async (id) => {
    const { data } = await api.get(`/roadmaps/${id}`);
    return data;
};

export const toggleWeekStatus = async (roadmapId, weekNumber, isCurrentlyCompleted) => {
    const action = isCurrentlyCompleted ? "uncomplete" : "complete";
    const { data } = await api.patch(`/roadmaps/${roadmapId}/week/${weekNumber}/${action}`);
    return data;
};

export const getAllRoadmaps = async () => {
    const { data } = await api.get("/roadmaps");
    return data; 
};

export const deleteRoadmapById = async (id) => {
    const { data } = await api.delete(`/roadmaps/${id}`);
    return data;
};


