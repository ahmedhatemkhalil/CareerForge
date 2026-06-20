/* eslint-disable no-undef */
// src/pages/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../services/authService";
import { loadUserTheme } from "../../utils/theme";
import { loadCurrentUser } from "../../utils/userProfile";
import { GoogleIcon } from "../../components/icons/SocialIcons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { loginSchema } from "../../schemas/loginSchema";


export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const socialButtonClassName =
  "flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:opacity-90 transition";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (formData) => {
    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      await loadCurrentUser();
      await loadUserTheme();
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    }
  };

  

 
  const handleGoogleLogin = () => {
    const clientId = "709262554956-ick9aq5hj3342ikue55ljtct3k62bdp9.apps.googleusercontent.com";
    const redirectUri = "http://localhost:5173/oauth/callback"; // تعديل البورت والمسار ليكون متناسق مع الفيت والـ callback

    localStorage.setItem("oauth_provider", "google"); // حفظ النوع عشان الـ callback

    const url =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=openid email profile`;

    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full lg:w-[45vw] lg:w-1/2 bg-card rounded-xl p-10">
        {/* Title */}
        <h1 className="text-1xl font-semibold text-center">Welcome Back</h1>

        <p className="text-sm text-center mt-2">
          Sign in to continue your career journey
        </p>

        {/* Social Buttons */}
<div className="mt-6 w-full px-4 sm:px-0 sm:max-w-sm mx-auto">
  <button
    type="button"
    onClick={handleGoogleLogin}
    className={`${socialButtonClassName} w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-border bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition text-foreground font-medium`}
  >
    <GoogleIcon />
    Google
  </button>
</div>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="px-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            Or sign in with email
          </span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Email
            </label>
            <input
              type="email"
              placeholder="m@gmail.com"
              {...register("email")}
              className="w-full h-12 rounded-xl bg-input-background border border-border px-4 text-foreground outline-none focus:border-brand-primary transition"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}{" "}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="w-full h-12 rounded-xl bg-input-background border border-border px-4 pr-12 text-foreground outline-none focus:border-brand-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}{" "}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-brand-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-brand-primary hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}