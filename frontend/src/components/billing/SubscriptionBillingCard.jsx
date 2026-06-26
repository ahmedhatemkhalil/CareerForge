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
import {
  formatAmount,
  formatPaymentDate,
  formatStatus,
} from "@/utils/paymentFormatters";

const SubscriptionBillingCard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [subscriptionData, paymentsData] = await Promise.all([
          getSubscription(),
          getMyPayments(),
        ]);

        setSubscription(subscriptionData);
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
      window.location.href = url;
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
                    Current period ends on
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatPaymentDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              )}
            </div>

            {payments.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Payment history
                </h3>

                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-brand-primary">
                            <CreditCard size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {formatAmount(payment.amount, payment.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Invoice {payment.stripeInvoiceId?.slice(-8) || "—"}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-status-success/10 px-2.5 py-1 text-xs font-semibold text-status-success">
                          {formatStatus(payment.status)}
                        </span>
                      </div>

                      <div className="mt-4 border-t border-border pt-4 text-sm">
                        <p className="text-xs text-muted-foreground">Paid on</p>
                        <p className="mt-1 font-medium text-foreground">
                          {formatPaymentDate(payment.paidAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment records yet.
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
