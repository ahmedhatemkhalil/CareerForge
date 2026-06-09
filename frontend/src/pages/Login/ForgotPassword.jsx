import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  forgotPassword,
  verifyResetOtp,
  resetPasswordWithOtp,
  resendOtpRequest,
} from "../../services/authService";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const otpRefs = useRef([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmitEmail = async (formData) => {
    try {
      const data = await forgotPassword(formData.email);
      setEmail(formData.email);
      setMessage(data.message || "Check your email for the OTP code.");
      setStep("otp");
      toast.success(data.message || "OTP sent to your email.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send OTP",
      );
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Enter the 6-digit code sent to your email.");
      return;
    }

    try {
      setIsOtpSubmitting(true);
      await verifyResetOtp({ email, otp: otpValue });
      setStep("reset");
      toast.success("OTP verified. Enter your new password.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Invalid or expired OTP",
      );
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const onResetPassword = async (formData) => {
    try {
      const otpValue = otp.join("");
      const data = await resetPasswordWithOtp({
        email,
        otp: otpValue,
        password: formData.password,
      });
      toast.success(data.message || "Password reset successfully");
      setStep("success");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reset password",
      );
    }
  };

  const resendOtp = async () => {
    try {
     const data = await resendOtpRequest(email);
      setMessage(data.message || "A new OTP has been sent.");
      setOtp(new Array(6).fill(""));
      otpRefs.current[0]?.focus();
      toast.success(data.message || "OTP resent to your email.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to resend OTP",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute  bg-brand-primary/30 blur-3xl rounded-full"></div>
      <div className="absolute  bg-brand-secondary/30 blur-3xl rounded-full"></div>

      <div className="w-full max-w-md relative">
        <div className="absolute inset-0  from-brand-primary to-brand-secondary rounded-3xl blur-xl opacity-20"></div>

        <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white text-2xl font-bold">
              ✦
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {step === "email" && "Forgot Password?"}
              {step === "otp" && "Enter OTP Code"}
              {step === "reset" && "Reset Password"}
              {step === "success" && "Success!"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {step === "email" &&
                "Enter your email to receive a 6-digit reset code."}
              {step === "otp" &&
                "Check your email and type the 6-digit code in the boxes below."}
              {step === "reset" && "Create a new password for your account."}
              {step === "success" &&
                "Your password has been reset successfully. You can login now."}
            </p>
          </div>

          {step === "email" && (
            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-5">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="m@gmail.com"
                  {...register("email")}
                  className="w-full h-12 rounded-xl bg-input-background border border-border px-4 text-foreground outline-none focus:border-brand-primary transition"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-5">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    ref={(el) => (otpRefs.current[index] = el)}
                    className="w-12 h-14 text-center rounded-xl bg-input-background border border-border text-2xl font-semibold text-foreground outline-none focus:border-brand-primary"
                  />
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {message}
              </div>

              <button
                type="button"
                onClick={onVerifyOtp}
                disabled={isOtpSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {isOtpSubmitting ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={resendOtp}
                className="w-full h-12 rounded-xl border border-border text-foreground bg-transparent hover:bg-slate-100 transition"
              >
                Resend Code
              </button>
            </div>
          )}

          {step === "reset" && (
            <form
              onSubmit={handleResetSubmit(onResetPassword)}
              className="space-y-5"
            >
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerReset("password")}
                  className="w-full h-12 rounded-xl bg-input-background border border-border px-4 text-foreground outline-none focus:border-brand-primary transition"
                />
                {resetErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {resetErrors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerReset("confirmPassword")}
                  className="w-full h-12 rounded-xl bg-input-background border border-border px-4 text-foreground outline-none focus:border-brand-primary transition"
                />
                {resetErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {resetErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isResetSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {isResetSubmitting ? "Saving..." : "Reset Password"}
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-5 text-center">
              <p className="text-foreground text-base">
                Your password has been reset successfully.
              </p>
              <Link
                to="/login"
                className="inline-block w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3 text-white font-semibold hover:opacity-90"
              >
                Go to Login
              </Link>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-brand-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
