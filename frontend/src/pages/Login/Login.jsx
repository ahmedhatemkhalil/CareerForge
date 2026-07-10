// src/pages/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import AuthBrandHeader from "@/components/auth/AuthBrandHeader";
import AuthDivider from "@/components/auth/AuthDivider";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { loginUser } from "@/services/authService";
import { loginSchema } from "@/schemas/loginSchema";
import useAuthStore from "@/stores/authStore";
import { loadUserTheme } from "@/utils/theme";
import { loadCurrentUser } from "@/utils/userProfile";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (formData) => {
    try {
      const data = await loginUser(formData);
      useAuthStore
        .getState()
        .login(data.user, data.accessToken, data.refreshToken);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full rounded-xl bg-card p-10 lg:w-[45vw] lg:w-1/2">
        <AuthBrandHeader
          title="Welcome back"
          subtitle="Sign in to continue your career journey"
        />

        <GoogleSignInButton />

        <AuthDivider label="Or sign in with email" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              placeholder="enter your email address"
              {...register("email")}
              className="h-12 w-full rounded-xl border border-border bg-input-background px-4 text-foreground outline-none transition focus:border-brand-primary"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="enter your password"
                {...register("password")}
                className="h-12 w-full rounded-xl border border-border bg-input-background px-4 pr-12 text-foreground outline-none transition focus:border-brand-primary"
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
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-brand-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

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
