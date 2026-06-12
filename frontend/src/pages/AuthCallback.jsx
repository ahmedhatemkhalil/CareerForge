// src/pages/AuthCallback.jsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios'; // تأكدي من صحة مسار ملف الأكسيوس عندك
import { loadUserTheme } from "../utils/theme";
import { loadCurrentUser } from "../utils/userProfile";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const provider = localStorage.getItem('oauth_provider') || 'google'; 

    if (code) {
      const verifyOAuth = async () => {
        try {
          // إرسال الكود للباك إند
          const response = await API.post(`/api/auth/oauth/${provider}`, {
            code,
            redirectUri: 'http://localhost:5173/auth/callback'
          });

          if (response.data.success) {
            // 1. حفظ الـ Tokens في الـ localStorage زي صفحة الـ Login بالظبط
            localStorage.setItem('token', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            
            // 2. تحميل بيانات المستخدم والثيم
            await loadCurrentUser();
            await loadUserTheme();

            // 3. تنظيف الـ localStorage وإظهار رسالة النجاح
            localStorage.removeItem('oauth_provider');
            toast.success(`Successfully authenticated via ${provider === 'google' ? 'Google' : 'GitHub'}!`);
            
            // 4. التوجيه للـ Dashboard
            navigate('/dashboard');
          }
        } catch (err) {
          console.error("OAuth Verification Error:", err);
          const errorMessage = err.response?.data?.message || "Authentication failed. Please try again.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      };

      verifyOAuth();
    } else {
      setError("Authorization code not found. Please log in again.");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 relative overflow-hidden">
      {/* الخلفية المضيئة المعتادة في التصاميم المودرن */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* الحاوية الزجاجية الاحترافية */}
      <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/60 rounded-2xl p-10 shadow-2xl relative z-10 text-center transition-all duration-300">
        {error ? (
          <div className="space-y-6">
            {/* أيقونة الخطأ */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Authentication Error</h2>
              <p className="text-sm text-muted-foreground px-2">{error}</p>
            </div>

            <button 
              onClick={() => navigate('/login')} 
              className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:opacity-90 transition duration-300 shadow-lg shadow-brand-primary/20"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* أنيميشن تحميل متطور ومتناسق مع الـ Glassmorphism */}
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-primary animate-spin"></div>
              <div className="w-6 h-6 bg-brand-secondary/40 rounded-full animate-ping"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground tracking-wide">Securing Your Connection</h2>
              <p className="text-sm text-muted-foreground animate-pulse">
                Verifying your account and preparing your career dashboard...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
