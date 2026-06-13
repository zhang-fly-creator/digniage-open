export const OPPORTUNITY_SOURCE_LABELS = {
  ai: "AI建议",
  rule: "系统提醒",
  manual: "人工创建",
};

export function normalizeOpportunitySource(source) {
  if (source === "manual") return "manual";
  if (source === "ai" || source === "AI建议" || source === "AI发现") return "ai";
  return "rule";
}

export function getOpportunitySourceLabel(source) {
  return OPPORTUNITY_SOURCE_LABELS[normalizeOpportunitySource(source)];
}

export function getOpportunitySourceBadgeClass(source) {
  const normalized = normalizeOpportunitySource(source);
  if (normalized === "ai") return "bg-app-blue text-app-ink";
  if (normalized === "manual") return "bg-app-green text-app-ink";
  return "bg-app-orangeSoft text-app-orange";
}
