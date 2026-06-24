import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "2 CV analyses / month",
  "1 mock interview / month",
  "1 career roadmap / month",
  "Basic match scoring",
  "Email support",
];

const PRO_FEATURES = [
  "Unlimited CV analyses",
  "Unlimited mock interviews",
  "Unlimited career roadmaps",
  "Advanced AI insights & feedback",
  "Priority email & chat support",
  "Early access to new features",
];

const PricingSection = ({
  variant = "landing",
  plan = "free",
  onUpgrade,
  isUpgrading = false,
}) => {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(variant === "app");
  const navigate = useNavigate();
  const isApp = variant === "app";
  const isPro = plan === "pro";

  useEffect(() => {
    if (isApp) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isApp]);

  return (
    <section
      ref={sectionRef}
      className={cn("py-16", isApp && "py-0")}
      id="pricing"
    >
      <div
        className={cn(
          "text-center mb-14 transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary">
          <Sparkles className="size-3.5" />
          Simple, transparent pricing
        </span>

        <h2 className="text-3xl md:text-4xl font-bold mt-6">Choose Your Plan</h2>

        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Start free and upgrade when you&apos;re ready to unlock unlimited AI-powered career tools.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div
          className={cn(
            "group relative bg-card border border-border rounded-2xl p-8 flex flex-col transition-all duration-700 ease-out hover:shadow-xl hover:shadow-brand-primary/5 hover:-translate-y-1 hover:scale-[1.02]",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
          style={{ transitionDelay: inView ? "100ms" : "0ms" }}
        >
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Free Plan
          </span>

          <div className="mt-4 flex items-end gap-1">
            <span className="text-5xl font-bold text-foreground">$0</span>
            <span className="text-muted-foreground mb-1.5">/ month</span>
          </div>

          <p className="text-sm text-muted-foreground mt-2">Perfect to get started</p>

          <ul className="mt-8 space-y-3.5 flex-1">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <Check className="size-4 text-status-success shrink-0 mt-0.5" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>

          {isApp ? (
            <Button
              variant="outline"
              size="lg"
              disabled
              className="mt-8 w-full h-12 text-base font-semibold border-2"
            >
              {isPro ? "Free Plan" : "Current Plan"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="mt-8 w-full h-12 text-base font-semibold border-2 cursor-pointer hover:bg-accent transition-all duration-300"
              onClick={() => navigate("/register")}
            >
              Start for Free
            </Button>
          )}
        </div>

        {/* Pro Plan */}
        <div
          className={cn(
            "group relative bg-card border-2 border-brand-primary rounded-2xl p-8 flex flex-col transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-brand-primary/15 hover:-translate-y-1 hover:scale-[1.02]",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
          style={{ transitionDelay: inView ? "250ms" : "0ms" }}
        >
          <span className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-1 text-xs font-bold text-white shadow-md">
            Most Popular
          </span>

          <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">
            Pro Plan
          </span>

          <div className="mt-4 flex items-end gap-1">
            <span className="text-5xl font-bold text-foreground">$9.99</span>
            <span className="text-muted-foreground mb-1.5">/ month</span>
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            Unlimited everything · Cancel anytime
          </p>

          <ul className="mt-8 space-y-3.5 flex-1">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <Check className="size-4 text-brand-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>

          {isApp ? (
            <Button
              size="lg"
              disabled={isPro || isUpgrading}
              className={cn(
                "mt-8 w-full h-12 text-base font-semibold text-white transition-all duration-300",
                isPro
                  ? "bg-muted text-muted-foreground"
                  : "bg-gradient-to-r from-brand-primary to-brand-secondary cursor-pointer hover:opacity-90 pricing-btn-shimmer"
              )}
              onClick={onUpgrade}
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Redirecting...
                </>
              ) : isPro ? (
                "Current Plan"
              ) : (
                <>
                  <Zap className="size-4 fill-current" />
                  Upgrade Now
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              className="mt-8 w-full h-12 text-base font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white cursor-pointer hover:opacity-90 transition-all duration-300 pricing-btn-shimmer"
              onClick={() => navigate("/register")}
            >
              <Zap className="size-4 fill-current" />
              Upgrade Now
            </Button>
          )}
        </div>
      </div>

      <p
        className={cn(
          "mt-10 text-center text-sm text-muted-foreground flex items-center justify-center gap-2 transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: inView ? "400ms" : "0ms" }}
      >
        <Shield className="size-4" />
        Secured &amp; powered by{" "}
        <span className="font-bold text-foreground tracking-tight">stripe</span>
      </p>
    </section>
  );
};

export default PricingSection;
