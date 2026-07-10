import { useLocation } from "react-router-dom";

export default function VerifyNotice() {

  const location = useLocation();

  const email = location.state?.email;


  return (
    <div className="min-h-screen flex items-center justify-center bg-background">

      <div className="bg-card p-10 rounded-3xl border border-border text-center w-full max-w-md">

        <div className="text-5xl mb-4">
          📧
        </div>


        <h1 className="text-3xl font-bold mb-3 text-foreground">
          Check Your Email
        </h1>


        <p className="text-muted-foreground">
          We sent a verification link to
        </p>


        <p className="font-semibold mt-2">
          {email}
        </p>


        <p className="mt-4 text-muted-foreground">
          Please click the link in your email
          to activate your account.
        </p>

      </div>

    </div>
  );
}