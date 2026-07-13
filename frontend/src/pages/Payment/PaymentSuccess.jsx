import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  confirmCheckoutSession,
  getSubscription,
} from "@/services/paymentService";
import useAuthStore from "@/stores/authStore";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);
  const [isConfirming, setIsConfirming] = useState(true);
  const hasRedirected = useRef(false);

  const applySubscriptionToUser = (subscription) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || !subscription) return;

    setUser({
      ...currentUser,
      plan: subscription.plan,
      subscriptionStatus: subscription.status,
      subscriptionCurrentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    });
  };

  const goToDashboard = () => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    navigate("/dashboard", { replace: true });
  };

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setIsConfirming(false);
      if (token) {
        goToDashboard();
      } else {
        navigate("/login", { replace: true });
      }
      return;
    }

    if (!token) {
      setIsConfirming(false);
      toast.error("Please log in to activate your Pro plan.");
      navigate("/login", { replace: true, state: { from: "/payment/success" } });
      return;
    }

    const activatePro = async () => {
      try {
        const subscription = await confirmCheckoutSession(sessionId);
        applySubscriptionToUser(subscription);
        toast.success("Payment successful! Welcome to Pro.");
        goToDashboard();
      } catch (error) {
        // Stripe webhook may have already upgraded the user
        try {
          const subscription = await getSubscription();
          if (subscription?.plan === "pro") {
            applySubscriptionToUser(subscription);
            toast.success("Payment successful! Welcome to Pro.");
            goToDashboard();
            return;
          }
        } catch {
          // fall through to error message
        }

        toast.error(
          error?.response?.data?.message ||
            "Payment received. Check Pricing in a moment if Pro is not active yet."
        );
        setIsConfirming(false);
      }
    };

    activatePro();
  }, [navigate, searchParams, setUser, token]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-xl p-8 text-center border border-border">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-status-success/10 rounded-full flex items-center justify-center text-status-success">
            {isConfirming ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : (
              <CheckCircle2 className="w-12 h-12" />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-2 font-medium">
          Thank you for your subscription!
        </p>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {isConfirming
            ? "Activating your Pro plan and redirecting to dashboard..."
            : "Your Pro plan is active. You can go to your dashboard now."}
        </p>

        <button
          type="button"
          onClick={goToDashboard}
          disabled={isConfirming}
          className="w-full bg-primary hover:bg-brand-primary-hover text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer disabled:opacity-60"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
