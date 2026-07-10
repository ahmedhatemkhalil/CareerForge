import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import UpgradeModal from "@/components/common/UpgradeModal";
import { getPlanLimitError } from "@/utils/planLimitError";

export function usePlanLimitModal() {
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({
    open: false,
    feature: "analysis",
    limit: null,
  });

  const handleError = useCallback((error, featureOverride) => {
    const planError = getPlanLimitError(error);
    if (!planError) return false;

    setModalState({
      open: true,
      feature: featureOverride || planError.feature,
      limit: planError.limit,
    });
    return true;
  }, []);

  const close = useCallback(() => {
    setModalState((current) => ({ ...current, open: false }));
  }, []);

  const onUpgrade = useCallback(() => {
    close();
    navigate("/pricing");
  }, [close, navigate]);

  const modal = (
    <UpgradeModal
      open={modalState.open}
      onClose={close}
      onUpgrade={onUpgrade}
      feature={modalState.feature}
      limit={modalState.limit}
    />
  );

  return { handleError, close, modal };
}
