// src/pages/Register.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { GoogleIcon, GithubIcon } from "../../components/icons/SocialIcons";
import { registerSchema } from "../../schemas/registerSchema";
import { registerUser } from "../../services/authService";

const socialButtonClassName =
  "flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold hover:opacity-90 transition";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-8 ">
  <div className="w-full lg:w-[45vw] lg:w-1/2 bg-card rounded-xl   p-10">
        {/* Title */}
        <h1 className="text-1xl font-semibold text-foreground ">
          Create Account
        </h1>

        <p className="text-sm text-muted-foreground mt-2">
          Start your career transformation today
        </p>


      {/* Social Buttons */}
<div className="grid grid-cols-2 gap-3 mt-6">
  <button type="button" className={socialButtonClassName}>
    <GoogleIcon />
    Google
  </button>

  <button type="button" className={socialButtonClassName}>
    <GithubIcon />
    GitHub
  </button>
</div>


 <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-border"></div>

          <span className="px-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            Or register with email
          </span>

          <div className="flex-1 h-px bg-border"></div>
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
       className="w-full h-12 rounded-xl bg-input-background border border-border px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition"
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
   
  );
}