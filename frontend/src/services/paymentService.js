import api from "./api";

export const getSubscription = async () => {
  const { data } = await api.get("/payments/subscription");
  return data;
};

export const createCheckoutSession = async () => {
  const { data } = await api.post("/payments/create-checkout-session");
  return data;
};
