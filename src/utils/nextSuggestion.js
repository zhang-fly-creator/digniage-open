const fallbackSuggestion = {
  opening: "下次可先从轻松、熟悉的话题开始，让老人慢慢进入交流状态。",
  pace: "沟通时放慢语速，一次只问一个问题，给老人充分表达时间。",
  avoid: "结合知老卡中的避免话题，交流中不主动触碰敏感内容。",
  followUp: "探访后记录老人状态和新信息，必要时补充到知老卡。",
};

export function normalizeNextSuggestion(value) {
  if (value && typeof value === "object") {
    return {
      opening: value.opening || fallbackSuggestion.opening,
      pace: value.pace || fallbackSuggestion.pace,
      avoid: value.avoid || fallbackSuggestion.avoid,
      followUp: value.followUp || fallbackSuggestion.followUp,
    };
  }

  if (typeof value === "string" && value.trim()) {
    return {
      ...fallbackSuggestion,
      opening: value,
    };
  }

  return fallbackSuggestion;
}

export function nextSuggestionToText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return [value.opening, value.pace, value.avoid, value.followUp].filter(Boolean).join(" ");
}

export function shortNextSuggestion(value) {
  const suggestion = normalizeNextSuggestion(value);
  return suggestion.opening;
}
