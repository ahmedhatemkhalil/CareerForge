/* eslint-disable no-undef */
import { useEffect ,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../../services/authService";
import { loadUserTheme } from "../../utils/theme";
import { loadCurrentUser } from "../../utils/userProfile";
import toast from "react-hot-toast";

export default function GoogleCallback() {
  const navigate = useNavigate();

  const isCalled = useRef(false); // إضافة ref لمنع التكرار

useEffect(() => {
  if (isCalled.current) return; // إذا تم الاستدعاء، توقفي
  isCalled.current = true;
    const loginWithGoogle = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          toast.error("Google login failed");
          navigate("/login");
          return;
        }

        const response = await googleLogin(code);

        localStorage.setItem(
          "token",
          response.data.accessToken
        );

        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        await loadCurrentUser();
        await loadUserTheme();

        toast.success("Login with Google successful");

    
        navigate("/dashboard");

      } catch (error) {
        toast.error(
          error?.response?.data?.error ||
          "Google login failed"
        );

        navigate("/login");
      }
    };

    loginWithGoogle();
  }, [navigate]);

return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <div className="text-center space-y-6">
        {/* Spinner Animation */}
        <div className="relative ml-8"> 
  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin-slow"></div>
</div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Authenticating...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we set up your profile.
          </p>
        </div>
      </div>
    </div>
  );
}