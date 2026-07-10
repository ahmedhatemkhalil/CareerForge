// src/pages/Register/Register.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import AuthBrandHeader from "@/components/auth/AuthBrandHeader";
import AuthDivider from "@/components/auth/AuthDivider";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { registerSchema } from "@/schemas/registerSchema";
import { registerUser } from "@/services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (formData) => {
    try {
      await registerUser(formData);
      toast.success("Account created successfully!");

      navigate("/verify-notice", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Register failed"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full rounded-xl bg-card p-10 lg:w-[45vw] lg:w-1/2">
        <AuthBrandHeader
          title="Create account"
          subtitle="Start your career transformation today"
        />

        <GoogleSignInButton label="Sign up with Google" />

        <AuthDivider label="Or register with email" />

        <form onSubmit={handleSubmit(handleRegister)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Full Name
            </label>
            <input
              type="text"
              placeholder="enter your full name"
              {...register("name")}
              className="h-12 w-full rounded-xl border border-border bg-input-background px-4 outline-none transition focus:ring-2 focus:ring-brand-primary/40"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              placeholder="enter your email address"
              {...register("email")}
              className="h-12 w-full rounded-xl border border-border bg-input-background px-4 outline-none transition focus:ring-2 focus:ring-brand-primary/40"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
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
                className="h-12 w-full rounded-xl border border-border bg-input-background px-4 pr-12 outline-none transition focus:ring-2 focus:ring-brand-primary/40"
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

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="confirm your password"
                {...register("confirmPassword")}
                className="h-12 w-full rounded-xl border border-border bg-input-background px-4 pr-12 outline-none transition focus:ring-2 focus:ring-brand-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
