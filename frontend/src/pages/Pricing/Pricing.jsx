import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PricingSection from "@/components/LandingPage/PricingSection";
import SubscriptionBillingCard from "@/components/billing/SubscriptionBillingCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  createCheckoutSession,
  getSubscription,
} from "@/services/paymentService";
import useAuthStore from "@/stores/authStore";

const Pricing = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const [plan, setPlan] = useState("free");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await getSubscription();
        setPlan(data.plan || "free");

        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setUser({
            ...currentUser,
            plan: data.plan,
            subscriptionStatus: data.status,
            subscriptionCurrentPeriodEnd: data.currentPeriodEnd,
            cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          });
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load subscription details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleUpgrade = async () => {
    setIsUpgrading(true);

    try {
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to start checkout session"
      );
      setIsUpgrading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-2 sm:pb-0">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
          Pricing &amp; Plans
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare plans and upgrade to unlock unlimited AI-powered career tools
        </p>
      </div>

      <PricingSection
        variant="app"
        plan={plan}
        onUpgrade={handleUpgrade}
        isUpgrading={isUpgrading}
      />

      <div className="mt-8">
        <SubscriptionBillingCard />
      </div>
    </div>
  );
};

export default Pricing;
