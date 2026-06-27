import api from "./api";

export const interviewService = {

 startInterview: async (analysisId) => {
  const { data } = await api.post("/interviews/start", {
    analysisId,
  });

  return data.data;
},

submitAnswer: async (sessionId, answer) => {
  const { data } = await api.post(
    `/interviews/${sessionId}/answer`,
    { answer }
  );

  return data;
},

 getInterviewById: async (sessionId) => {
    const { data } = await api.get(`/interviews/${sessionId}`);
    return data; 
  },

  getAllInterviews: async () => {
    const { data } = await api.get("/interviews");
    return {
      count: data?.count ?? data?.data?.length ?? 0,
      data: data?.data ?? [],
    };
  },

  deleteInterview: async (sessionId) => {
    const { data } = await api.delete(`/interviews/${sessionId}`);
    return data.data;
  },

  deleteAllInterviews: async () => {
    const { data } = await api.delete("/interviews");
  return data;
},
};