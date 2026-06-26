const FEATURE_MAP = {
  analysis: "analysis",
  interview: "interview",
  roadmap: "roadmap",
};

export function getPlanLimitError(error) {
  if (error?.response?.status !== 403) return null;

  const data = error.response.data || {};
  const text = data.message || data.error || "";

  if (
    !text.toLowerCase().includes("exceeded") ||
    !text.toLowerCase().includes("limit")
  ) {
    return null;
  }

  const limitMatch = text.match(/Maximum allowed:\s*(\d+)/i);
  const featureMatch = text.match(/monthly\s+(\w+)\s+limit/i);
  const rawFeature = featureMatch?.[1]?.toLowerCase();

  return {
    message: text,
    limit: limitMatch ? Number(limitMatch[1]) : null,
    feature: FEATURE_MAP[rawFeature] || "analysis",
  };
}
