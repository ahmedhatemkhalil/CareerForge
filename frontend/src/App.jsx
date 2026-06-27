import { useEffect } from "react";

import AppRouter from "./AppRouter";
import LoadingSpinner from "./components/common/LoadingSpinner";
import useAuthStore from "./stores/authStore";

const App = () => {
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return <AppRouter />;
};

export default App;
