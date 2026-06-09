// src/pages/Register.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { registerSchema } from "../../schemas/registerSchema";
import { registerUser } from "../../services/authService";
export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
const {
  register,
  handleSubmit,
  formState: {
    errors,
    isSubmitting,
  },
} = useForm({
  resolver: zodResolver(registerSchema),
});
  // const [formData, setFormData] = useState({
  //   name: "",
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  // });



  // // Handle Input Change
  // const handleChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  // Handle Register
  const handleRegister = async (formData) => {
    try {
      const data = await registerUser(formData);
      toast.success(
        "Account created! Check your email to verify your account."
      );

      navigate("/login");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Register failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden ">
      
      {/* Background Glow */}
      <div className="absolute rounded-full"></div>

      <div className="absolute  rounded-full"></div>

      {/* Card */}
  <div className="w-full max-w-lg md:max-w-xl relative">

        <div className="absolute inset-0  from-brand-primary to-brand-secondary rounded-3xl blur-xl opacity-20"></div>

        <div className="relative bg-card/100 backdrop-blur-xl border border-border rounded-3xl p-10 md:p-12 shadow-2xl">
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white text-2xl font-bold">
              ✦
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Create Account
            </h1>

            <p className="text-muted-foreground mt-2 text-sm">
              Start your career transformation today
            </p>
          </div>

          {/* Form */}
          <form
      onSubmit={handleSubmit(handleRegister)}
      className="space-y-5"
    >
            {/* Name */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Full Name
              </label>

             <input
            type="text"
             placeholder="Amany Mahmoud"
             {...register("name")}
          className="w-full h-12 rounded-xl
           bg-input-background border border-border px-4 
           rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
           />

        {errors.name && (
         <p className="text-red-500 text-sm mt-1">
         {errors.name.message}
        </p>
           )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Email
              </label>

             <input
      type="email"
      placeholder="m@example.com"
        {...register("email")}
       className="w-full h-12 rounded-xlbg-input-background border border-border px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
        />

     {errors.email && (
      <p className="text-red-500 text-sm mt-1">
       {errors.email.message}
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
       className="w-full h-12 rounded-xl bg-input-background border border-border px-4 pr-12"
     />

     {errors.password && (
      <p className="text-red-500 text-sm mt-1">
    {errors.password.message}
       </p>
         )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
             <input
              type={showPassword ? "text" : "password"}

  placeholder="••••••••"
  {...register("confirmPassword")}
  className="w-full h-12 rounded-xl bg-input-background border border-border px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
/>

{errors.confirmPassword && (
  <p className="text-red-500 text-sm mt-1">
    {errors.confirmPassword.message}
  </p>
)}
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>   
            </div>
           </div>
            {/* Button */}
            <button
              type="submit"
             disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
             {isSubmitting
  ? "Creating..."
  : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-primary hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}