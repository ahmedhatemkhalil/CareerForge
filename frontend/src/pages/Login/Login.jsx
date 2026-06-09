import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../services/authService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { loginSchema } from "../../schemas/loginSchema";
export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });
  // const [formData, setFormData] = useState({
  //   email: "",
  //   password: "",
  // });

  // const [loading, setLoading] = useState(false);

  // Handle Input Change
  // const handleChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  // Handle Login
  // const handleLogin = async (e) => {
  //   e.preventDefault();

  //   try {
  //     setLoading(true);

  //     const data = await loginUser(formData);

  //     console.log(data);

  //     // Save Token
  //     localStorage.setItem("token", data.token);

  //     // Save User
  //     localStorage.setItem(
  //       "user",
  //       JSON.stringify(data.user)
  //     );

  //     alert("Login Success");

  //     navigate("/dashboard");
  //   } catch (error) {
  //     console.log(error.message);
  //     alert(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const onSubmit = async (formData) => {
    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Login failed",
      );
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-100px] left-[-100px] bg-brand-primary/30 blur-3xl rounded-full"></div>

      <div className="absolute bottom-[-100px] right-[-100px]   rounded-full"></div>

      {/* Card */}
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0  from-brand-primary to-brand-secondary rounded-3xl blur-xl opacity-20"></div>

        <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              ✦
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>

            <p className="text-muted-foreground mt-2 text-sm">
              Sign in to continue your career journey
            </p>
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
                name="email"
                placeholder="m@gmail.com"
                {...register("email")}
                // value={formData.email}
                // onChange={handleChange}
                required
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
                  name="password"
                  placeholder="••••••••"
                  {...register("password")}
                  // value={formData.password}
                  // onChange={handleChange}
                  required
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
    </div>
  );
}
