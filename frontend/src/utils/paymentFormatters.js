export function formatPaymentDate(isoDate) {
  if (!isoDate) return "—";

  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatAmount(amount, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function formatStatus(status) {
  if (!status) return "—";
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
