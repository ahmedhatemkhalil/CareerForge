import api from "./api";

export const getSubscription = async () => {
  const { data } = await api.get("/payments/subscription");
  return data;
};

export const getMyPayments = async () => {
  const { data } = await api.get("/payments/my-payments");
  return data;
};

export const createCheckoutSession = async () => {
  const { data } = await api.post("/payments/create-checkout-session");
  return data;
};

export const confirmCheckoutSession = async (sessionId) => {
  const { data } = await api.post("/payments/confirm-checkout-session", {
    session_id: sessionId,
  });
  return data;
};

export const createPortalSession = async () => {
  const { data } = await api.post("/payments/create-portal-session");
  return data;
};
