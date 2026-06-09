import {useNavigate, Link,useLocation } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { resetPasswordWithOtp } from "../../services/authService";
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
 
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });
const { email, otp } = location.state || {};
if (!email || !otp) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Invalid Request
        </h2>
        <p className="mb-4">
          Please restart the password reset process.
        </p>
        <Link
          to="/forgot-password"
          className="text-blue-500"
        >
          Forgot Password
        </Link>
      </div>
    </div>
  );
}
const onSubmit = async (formData) => {
  try {
    const data = await resetPasswordWithOtp({
      email,
      otp,
      password: formData.password,
    });

    toast.success(data.message || "Password reset successfully");
    setResetSuccess(true);
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error?.message ||
      "Password reset failed"
    );
  }
};







  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Password Reset Successful
          </h1>
          <p className="text-muted-foreground mb-6">
            Your password has been updated. You can now sign in with your new
            password.
          </p>
          <Link
            to="/login"
            className="inline-block rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3 text-white font-semibold hover:opacity-90"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-brand-primary/30 blur-3xl rounded-full"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-brand-secondary/30 blur-3xl rounded-full"></div>

      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-3xl blur-xl opacity-20"></div>

        <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white text-2xl font-bold">
              ✦
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Reset Password
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Create a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full h-12 rounded-xl bg-input-background border border-border px-4 pr-12"
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
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="w-full h-12 rounded-xl bg-input-background border border-border px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
