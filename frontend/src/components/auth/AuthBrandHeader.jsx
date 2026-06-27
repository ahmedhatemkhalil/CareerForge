import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const AuthBrandHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-8 text-center">
      <Link
        to="/"
        className="inline-flex flex-col items-center gap-3 no-underline transition-opacity hover:opacity-90"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/20">
          <Sparkles size={22} strokeWidth={2.25} />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
          CareerForge
        </span>
      </Link>

      <h1 className="mt-6 text-2xl font-semibold text-foreground">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
};

export default AuthBrandHeader;
