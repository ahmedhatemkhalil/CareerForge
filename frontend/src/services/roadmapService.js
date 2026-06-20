// src/services/roadmapService.js
import axios from 'axios';

const api = axios.create({ 
  baseURL: 'http://localhost:5000/api' 
});

// إضافة Interceptor لإرسال التوكين تلقائياً مع كل طلب
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // تأكدي أن التوكين مخزن هنا
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const getAnalyses = () => api.get('/analysis');
export const postRoadmap = (data) => api.post('/roadmaps', data); 