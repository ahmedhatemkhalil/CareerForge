const AuthDivider = ({ label }) => {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="whitespace-nowrap text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
};

export default AuthDivider;
