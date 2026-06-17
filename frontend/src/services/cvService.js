import api from "./api";
export const getCVById = async (cvId) => {
  const { data } = await api.get(`/cvs/${cvId}`);
  return data.data;
};
// Upload CV
export const uploadCV = async (file) => {
  const formData = new FormData();
  formData.append("cvFile", file);

  const response = await api.post("/cvs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const getMyCVs = async () => {
  const { data } = await api.get("/cvs");
  return data.data.cvs;
};
// Get all CVs
export const getAllCVs = async () => {
  const response = await api.get("/cvs");
  return response.data;
};

// Delete CV
export const deleteCV = async (id) => {
  const response = await api.delete(`/cvs/${id}`);
  return response.data;
};

// Set active CV
export const setActiveCV = async (id) => {
  const response = await api.patch(`/cvs/${id}/set-active`);

  return response.data;
};

// Get all analyses
export const getAllAnalyses = async () => {
  const response = await api.get("/analysis");
  return response.data;
};

// Create AI CV analysis
export const createCVAnalysis = async (cvId, jobId) => {
  const response = await api.post("/analysis", {
    cvId,
    jobId,
  });

  return response.data;
};

// Get all jobs
export const getAllJobs = async () => {
  const response = await api.get("/job-descriptions");

  return response.data;
};


