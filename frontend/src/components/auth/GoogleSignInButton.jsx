import { GoogleBrandIcon } from "@/components/icons/SocialIcons";
import { startGoogleOAuth } from "@/utils/googleOAuth";

const GoogleSignInButton = ({ label = "Continue with Google" }) => {
  return (
    <button
      type="button"
      onClick={startGoogleOAuth}
      className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition hover:border-brand-primary/25 hover:bg-muted/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
    >
      <GoogleBrandIcon className="size-5 shrink-0 transition group-hover:scale-105" />
      <span>{label}</span>
    </button>
  );
};

export default GoogleSignInButton;
