import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import ProPlanBadge from "@/components/common/ProPlanBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createPortalSession,
  getMyPayments,
  getSubscription,
} from "@/services/paymentService";
import useAuthStore from "@/stores/authStore";
import {
  formatAmount,
  formatPaymentDate,
  formatStatus,
} from "@/utils/paymentFormatters";

const SubscriptionBillingCard = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);

  const syncAuthPlan = (subscriptionData) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || !subscriptionData) return;

    setUser({
      ...currentUser,
      plan: subscriptionData.plan,
      subscriptionStatus: subscriptionData.status,
      subscriptionCurrentPeriodEnd: subscriptionData.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
    });
  };

  const refreshSubscription = async () => {
    const subscriptionData = await getSubscription();
    setSubscription(subscriptionData);
    syncAuthPlan(subscriptionData);
    return subscriptionData;
  };

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [subscriptionData, paymentsData] = await Promise.all([
          getSubscription(),
          getMyPayments(),
        ]);

        setSubscription(subscriptionData);
        syncAuthPlan(subscriptionData);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load billing details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const isPro = subscription?.plan === "pro";

  const handleManageBilling = async () => {
    setIsOpeningPortal(true);

    try {
      const { url } = await createPortalSession();
      window.open(url, "_blank", "noopener,noreferrer");
      setIsOpeningPortal(false);

      const onFocus = () => {
        window.removeEventListener("focus", onFocus);
        refreshSubscription().catch(() => {});
      };
      window.addEventListener("focus", onFocus);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to open billing portal"
      );
      setIsOpeningPortal(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base sm:text-lg">
            Your subscription
          </CardTitle>
          {isPro && <ProPlanBadge />}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading billing details...</p>
        ) : (
          <>
            <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current plan
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {isPro ? "CareerForge Pro" : "Free plan"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatStatus(subscription?.status || (isPro ? "active" : "free"))}
                </p>
              </div>

              {isPro && subscription?.currentPeriodEnd && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {subscription?.cancelAtPeriodEnd
                      ? "Pro access until"
                      : "Current period ends on"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatPaymentDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              )}
            </div>

            {isPro && subscription?.cancelAtPeriodEnd && subscription?.currentPeriodEnd && (
              <p className="rounded-xl border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm leading-relaxed text-foreground">
                Your subscription is set to cancel. You&apos;ll keep Pro until{" "}
                <span className="font-semibold">
                  {formatPaymentDate(subscription.currentPeriodEnd)}
                </span>
                . After that, your account will move to the Free plan.
              </p>
            )}


            {isPro && (
              <Button
                type="button"
                onClick={handleManageBilling}
                disabled={isOpeningPortal}
                className="h-10 gap-2 sm:w-auto"
              >
                {isOpeningPortal ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ExternalLink size={16} />
                )}
                Manage subscription
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionBillingCard;
