export function canViewElderSensitiveInfo(role) {
  return role === "org_admin" || role === "staff";
}

export function canEditElderSensitiveInfo(role) {
  return role === "org_admin" || role === "staff";
}

export function maskIdCardNumber(idCardNumber) {
  const normalized = String(idCardNumber || "").trim().toUpperCase();
  if (!normalized) return "";
  const last4 = normalized.slice(-4);
  const hiddenLength = Math.max(0, normalized.length - 4);
  return `${"*".repeat(hiddenLength)}${last4}`;
}

export function normalizeIdCardNumber(value) {
  return String(value || "").trim().toUpperCase();
}

export function isValidIdCardNumber(value) {
  const normalized = normalizeIdCardNumber(value);
  if (!normalized) return true;
  return /^\d{17}[\dX]$/.test(normalized);
}

export function getIdCardLast4(value) {
  const normalized = normalizeIdCardNumber(value);
  return normalized ? normalized.slice(-4) : "";
}

export function extractBirthDateFromIdCard(value) {
  const normalized = normalizeIdCardNumber(value);
  if (!/^\d{17}[\dX]$/.test(normalized)) return "";
  const birth = normalized.slice(6, 14);
  const formatted = `${birth.slice(0, 4)}-${birth.slice(4, 6)}-${birth.slice(6, 8)}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(formatted) ? formatted : "";
}

export function stripSensitiveElderFields(elder = {}) {
  if (!elder || typeof elder !== "object") return elder;
  const { idCardNumber, idCardLast4, idCardUpdatedAt, idCardUpdatedBy, ...rest } = elder;
  return rest;
}
