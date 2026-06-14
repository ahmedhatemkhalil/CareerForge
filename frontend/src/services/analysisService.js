import api from "./api";

// جلب كل التحليلات
export const getAllAnalyses = async () => {
  try {
    const response = await api.get("/analysis");
    return response.data;
  } catch (error) {
    console.error("Error fetching analyses:", error);
    throw error;
  }
};

// حذف تحليل
export const deleteAnalysis = async (id) => {
  try {
    const response = await api.delete(`/analysis/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting analysis:", error);
    throw error;
  }
};