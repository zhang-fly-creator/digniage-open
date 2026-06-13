export const SERVICE_DURATION_OPTIONS = [
  { label: "0.5小时", value: 0.5 },
  { label: "1小时", value: 1 },
  { label: "1.5小时", value: 1.5 },
  { label: "2小时", value: 2 },
  { label: "2.5小时", value: 2.5 },
  { label: "3小时", value: 3 },
  { label: "3.5小时", value: 3.5 },
  { label: "4小时", value: 4 },
  { label: "4小时以上", value: 4 },
];

export function normalizeDurationHours(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.min(numeric, 4);
}

export function normalizeDurationStatus(value, fallback = "confirmed") {
  return value === "pending" || value === "confirmed" ? value : fallback;
}

export function formatDurationHours(value) {
  const hours = normalizeDurationHours(value);
  return hours > 0 ? `${hours}小时` : "未填写";
}

export function durationStatusLabel(value) {
  return normalizeDurationStatus(value) === "pending" ? "待确认" : "已确认";
}

export function sumDurationHours(records = [], status = "") {
  return records.reduce((total, record) => {
    if (status && normalizeDurationStatus(record?.durationStatus) !== status) return total;
    return total + normalizeDurationHours(record?.durationHours);
  }, 0);
}

export function formatDurationTotal(value) {
  const numeric = Number(value);
  const rounded = Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric * 10) / 10 : 0;
  return `${rounded}小时`;
}
