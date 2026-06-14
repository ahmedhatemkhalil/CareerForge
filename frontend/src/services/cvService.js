import axios from "axios";

const API = "http://localhost:5000/api/cvs";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const uploadCV = async (file) => {
  const formData = new FormData();
  formData.append("cvFile", file);

  const response = await axios.post(
    `${API}/upload`,
    formData,
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getAllCVs = async () => {
  const response = await axios.get(API, {
    headers: getHeaders(),
  });

  return response.data;
};

export const deleteCV = async (id) => {
  const response = await axios.delete(
    `${API}/${id}`,
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

export const setActiveCV = async (id) => {
  const response = await axios.patch(
    `${API}/${id}/set-active`,
    {},
    {
      headers: getHeaders(),
    }
  );

  return response.data;
};

// 1. جلب التحليلات - تعديل الرابط إلى المفرد /api/analysis ليطابق الباك إند
export const getAllAnalyses = async () => {
  const response = await axios.get("http://localhost:5000/api/analysis", {
    headers: getHeaders(),
  });
  return response.data; 
};

// 2. إنشاء تحليل جديد بالـ AI - تعديل الرابط إلى المفرد /api/analysis
export const createCVAnalysis = async (cvId, jobId) => {
  const response = await axios.post(
    "http://localhost:5000/api/analysis",
    { cvId, jobId },
    { headers: getHeaders() }
  );
  return response.data;
};

// 3. جلب الوظائف الخاصة بالمستخدم (تعديل الرابط الحقيقي)
// 💡 ملاحظة: لو الرابط عندك في الـ index.js الرئيسي للباك إند اسمه job-descriptions، غيري الكلمة تحت ليها
export const getAllJobs = async () => {
  const response = await axios.get("http://localhost:5000/api/job-descriptions", {
    headers: getHeaders(),
  });
  return response.data;
};