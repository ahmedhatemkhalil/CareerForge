import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyEmail } from "../../services/authService";

export default function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const data = await verifyEmail(token);
        setIsSuccess(true);
        toast.success("Email verified successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        setIsSuccess(false);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Email verification failed"
        );
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verify();
    }
  }, [token, navigate]);

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

          <div className="text-center">
            {isVerifying ? (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Verifying Email...
                </h1>
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address
                </p>
              </>
            ) : isSuccess ? (
              <>
                <h1 className="text-3xl font-bold text-green-500 mb-4">
                  ✔ Email Verified!
                </h1>
                <p className="text-muted-foreground mb-4">
                  Your account is now active. Redirecting to login...
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-red-500 mb-4">
                  Verification Failed
                </h1>
                <p className="text-muted-foreground">
                  The verification link is invalid or has expired.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
