import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analysis'; // عدلي الروتر والبورت حسب مشروعك

// أضيفي هذه الدالة في ملف السيرفيس الخاص بكِ (مثلاً cvService.js)
export const getAllAnalyses = async () => {
  try {
    const token = localStorage.getItem("token"); // تأكدي من طريقة جلب التوكن عندك
    const response = await axios.get("http://localhost:5000/api/analyses", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // الباك إند بيرجع البيانات هنا
  } catch (error) {
    console.error("Error fetching analyses:", error);
    throw error;
  }
};

export const deleteAnalysis = async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};