import { Navigate, Outlet } from "react-router-dom";

import useAuthStore from "@/stores/authStore";

const GuestRoute = () => {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
