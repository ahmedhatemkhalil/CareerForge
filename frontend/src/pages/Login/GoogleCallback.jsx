import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../../services/authService";
import toast from "react-hot-toast";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
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

        // نحفظ بيانات اليوزر
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        toast.success("Login with Google successful");

        // نروح للداشبورد
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
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-xl font-semibold">
        Signing in with Google...
      </h1>
    </div>
  );
}