import {
  analyzeServiceRecord,
  generateServiceOpportunities,
} from "../services/aiService";
import {
  deriveBirthdayMonthDay,
  getAppData,
  getElders as readElders,
  resolveElderBirthdayMonthDay,
  getServiceOpportunities,
  getServiceRecords,
  normalizeGeneratedOpportunities,
  saveElders,
  saveServiceOpportunities,
  saveServiceRecords,
} from "../services/storageService";
import { getIdCardLast4, normalizeIdCardNumber } from "./privacy";
import { normalizeDurationHours, normalizeDurationStatus } from "./serviceDuration";
import { getChineseElderAvatar, isGeneratedChineseElderAvatar } from "./avatars";

function daysUntilBirthday(elderOrBirthday) {
  const mmdd =
    typeof elderOrBirthday === "object" && elderOrBirthday !== null
      ? resolveElderBirthdayMonthDay(elderOrBirthday)
      : deriveBirthdayMonthDay(elderOrBirthday);

  if (!mmdd) return null;

  const [month, day] = mmdd.split("-").map(Number);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let target = new Date(today.getFullYear(), month - 1, day);

  if (Number.isNaN(target.getTime())) return null;
  if (target < start) target = new Date(today.getFullYear() + 1, month - 1, day);

  return Math.round((target - start) / (24 * 60 * 60 * 1000));
}

function shouldKeepBirthdayOpportunity(elder) {
  const days = daysUntilBirthday(elder);
  return days !== null && days >= 0 && days <= 14;
}

function normalizeStatus(status) {
  if (status === "done" || status === "completed") return "completed";
  if (status === "dismissed") return "dismissed";
  return "pending";
}

function isBirthdayType(type) {
  const value = String(type || "");
  return value.includes("ÉúÈÕ") || value.includes("Éú³½");
}

function getCurrentOrganizationId() {
  return getAppData().currentOrganizationId || "org_demo";
}

function normalizeElder(elder) {
  const careNoteInput = elder.careNoteInput ?? elder.serviceNote ?? elder.careNote ?? "";
  const staffNote = elder.staffNote ?? elder.note ?? "";
  const aiFavoriteTopics = elder.aiFavoriteTopics ?? "";
  const normalizedIdCardNumber = normalizeIdCardNumber(elder.idCardNumber);

  return {
    ...elder,
    organizationId: elder.organizationId || getCurrentOrganizationId(),
    status: elder.status === "archived" ? "archived" : "active",
    archivedAt: elder.archivedAt || "",
    archivedReason: elder.archivedReason || "",
    birthday: elder.birthday || resolveElderBirthdayMonthDay(elder),
    careDate: elder.careDate || "",
    storeName: elder.storeName || "",
    contactNote: elder.contactNote || "",
    otherContactInfo: elder.otherContactInfo || "",
    idCardNumber: normalizedIdCardNumber,
    idCardLast4: elder.idCardLast4 || getIdCardLast4(normalizedIdCardNumber),
    idCardUpdatedAt: elder.idCardUpdatedAt || "",
    idCardUpdatedBy: elder.idCardUpdatedBy || "",
    lifeExperience: elder.lifeExperience || "",
    favoriteTopics: elder.favoriteTopics || "",
    aiFavoriteTopics,
    communicationAdvice: elder.communicationAdvice || elder.communicationStyle || "",
    careNoteInput,
    staffNote,
    careNote: elder.careNote || careNoteInput,
    tags: Array.isArray(elder.tags) ? elder.tags : [],
    avatar:
      elder.avatar && !isGeneratedChineseElderAvatar(elder.avatar)
        ? elder.avatar
        : isGeneratedChineseElderAvatar(elder.avatar)
          ? elder.avatar
          : getChineseElderAvatar(elder.id, elder.gender),
  };
}

function normalizeOpportunity(item) {
  return {
    ...item,
    organizationId: item.organizationId || getCurrentOrganizationId(),
    elderId: item.elderId || "",
    status: normalizeStatus(item.status),
    source:
      item.source === "manual"
        ? "manual"
        : item.source === "ai_record_analysis"
          ? "ai"
          : item.source === "ai" || item.source === "AIå»ºè®®" || item.source === "AIå‘çŽ°"
            ? "ai"
            : "rule",
    createdByUserId: item.createdByUserId || "",
    createdByName: item.createdByName || "",
    createdByRole: item.createdByRole || "",
    assignedToUserId: item.assignedToUserId || "",
    assignedToMemberId: item.assignedToMemberId || "",
    assignedToName: item.assignedToName || "",
    assignedRole: item.assignedRole || "",
    assignedAt: item.assignedAt || "",
    assignedBy: item.assignedBy || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    relatedRecordId: item.relatedRecordId || "",
    completedAt: item.completedAt || "",
    dismissReason: item.dismissReason || "",
    dismissedAt: item.dismissedAt || "",
    isDemo: Boolean(item.isDemo || item.sample),
  };
}

function normalizeRecord(record) {
  return {
    ...record,
    organizationId: record.organizationId || getCurrentOrganizationId(),
    relatedOpportunityId: record.relatedOpportunityId || "",
    durationHours: normalizeDurationHours(record.durationHours),
    durationStatus: normalizeDurationStatus(record.durationStatus),
    confirmedBy: record.confirmedBy || "",
    confirmedAt: record.confirmedAt || "",
    generatedOpportunities: normalizeGeneratedOpportunities(record.generatedOpportunities),
  };
}

function sortByUpdatedAt(elders) {
  return [...elders].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function sortOpportunities(opportunities) {
  return [...opportunities].sort((a, b) => {
    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    if (aTime !== bTime) return aTime - bTime;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

function sortRecords(records) {
  return [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function ensureSeedData() {
  getAppData();
}

export function getElders() {
  const elders = readElders();
  const normalizedElders = elders.map(normalizeElder);

  if (JSON.stringify(elders) !== JSON.stringify(normalizedElders)) {
    saveElders(normalizedElders);
  }

  return sortByUpdatedAt(normalizedElders);
}

export function getElderById(id) {
  return getElders().find((elder) => elder.id === id);
}

export function saveElder(elder) {
  const elders = getElders();
  const normalized = normalizeElder(elder);
  const index = elders.findIndex((item) => item.id === normalized.id);

  if (index >= 0) {
    elders[index] = normalized;
  } else {
    elders.unshift(normalized);
  }

  saveElders(elders);
  return normalized;
}

export function archiveElder(id, reason) {
  if (!String(reason || "").trim()) return getElders();

  const elders = getElders();
  const target = elders.find((elder) => elder.id === id);
  if (!target) return elders;

  const archivedAt = new Date().toISOString();
  const nextElders = elders.map((elder) =>
    elder.id === id
      ? normalizeElder({
          ...elder,
          status: "archived",
          archivedAt,
          archivedReason: reason,
          updatedAt: archivedAt,
        })
      : elder
  );

  saveElders(nextElders);
  return getElders();
}

export function restoreElder(id) {
  const elders = getElders();
  const target = elders.find((elder) => elder.id === id);
  if (!target) return elders;

  const restoredAt = new Date().toISOString();
  const nextElders = elders.map((elder) =>
    elder.id === id
      ? normalizeElder({
          ...elder,
          status: "active",
          archivedAt: "",
          archivedReason: "",
          updatedAt: restoredAt,
        })
      : elder
  );

  saveElders(nextElders);
  return getElders();
}

export function getStoredOpportunities() {
  const elders = getElders();
  const stored = getServiceOpportunities()
    .map(normalizeOpportunity)
    .filter((item) => {
      if (!isBirthdayType(item.type)) return true;
      const elder = elders.find((elderItem) => elderItem.id === item.elderId);
      return shouldKeepBirthdayOpportunity(elder);
    });

  const raw = getServiceOpportunities();
  if (JSON.stringify(raw) !== JSON.stringify(stored)) {
    saveServiceOpportunities(stored);
  }

  return stored;
}

export function getOpportunities() {
  const elders = getElders();
  const storedOpportunities = getStoredOpportunities();
  const records = getRecords();
  const aiOpportunities = generateServiceOpportunities({
    elders,
    records,
    opportunities: storedOpportunities,
  }).map(normalizeOpportunity);

  const storedIds = new Set(storedOpportunities.map((item) => item.id));
  const generated = aiOpportunities.filter((item) => !storedIds.has(item.id));

  return sortOpportunities([...storedOpportunities, ...generated]);
}

function upsertStoredOpportunity(nextTarget) {
  const stored = getStoredOpportunities();
  const existingIndex = stored.findIndex((item) => item.id === nextTarget.id);
  const nextStored =
    existingIndex >= 0
      ? stored.map((item) => (item.id === nextTarget.id ? nextTarget : item))
      : [nextTarget, ...stored];

  saveServiceOpportunities(nextStored);
  return getOpportunities();
}

function getOpportunityForUpdate(id) {
  return getOpportunities().find((item) => item.id === id);
}

export function dismissOpportunity(id, reason) {
  const target = getOpportunityForUpdate(id);
  if (!target || target.status !== "pending") return getOpportunities();
  if (!String(reason || "").trim()) return getOpportunities();

  return upsertStoredOpportunity(
    normalizeOpportunity({
      ...target,
      status: "dismissed",
      dismissReason: reason,
      dismissedAt: new Date().toISOString(),
    })
  );
}

export function getRecords() {
  return sortRecords(getServiceRecords().map(normalizeRecord));
}

export function getRecordsByElderId(elderId) {
  return getRecords().filter((record) => record.elderId === elderId);
}

function completeRelatedOpportunity(opportunityId, recordId) {
  if (!opportunityId) return null;

  const stored = getStoredOpportunities();
  const all = getOpportunities();
  const target = all.find((item) => item.id === opportunityId);
  if (!target) return null;

  const completed = normalizeOpportunity({
    ...target,
    status: "completed",
    relatedRecordId: recordId,
    completedAt: new Date().toISOString(),
    dismissReason: "",
    dismissedAt: "",
  });
  const exists = stored.some((item) => item.id === opportunityId);
  const nextStored = exists
    ? stored.map((item) => (item.id === opportunityId ? completed : item))
    : [completed, ...stored];

  saveServiceOpportunities(nextStored);
  return completed;
}

export function addServiceRecord(record) {
  const elder = getElderById(record.elderId);
  const aiResult = analyzeServiceRecord({ elder, record });
  const generatedOpportunities = normalizeGeneratedOpportunities(
    record.generatedOpportunities?.length
      ? record.generatedOpportunities
      : aiResult.generatedOpportunities || (aiResult.serviceOpportunity ? [aiResult.serviceOpportunity] : [])
  );
  const enhancedRecord = normalizeRecord({
    ...record,
    nextSuggestion: record.nextSuggestion || aiResult.nextSuggestion,
    aiSuggestedTags: aiResult.suggestedTags || [],
    generatedOpportunities,
  });

  saveServiceRecords([enhancedRecord, ...getRecords()]);
  completeRelatedOpportunity(enhancedRecord.relatedOpportunityId, enhancedRecord.id);

  if (elder) {
    saveElder({
      ...elder,
      tags: [...new Set([...(elder.tags || []), ...(aiResult.suggestedTags || [])])].slice(0, 6),
      nextSuggestion: enhancedRecord.nextSuggestion || elder.nextSuggestion,
      updatedAt: new Date().toISOString(),
    });
  }

  return enhancedRecord;
}

export function updateServiceRecord(recordId, patch) {
  const records = getRecords();
  const existing = records.find((record) => record.id === recordId);
  if (!existing) {
    throw new Error("Service record not found.");
  }

  const nextRecord = normalizeRecord({
    ...existing,
    serviceType: patch.serviceType ?? existing.serviceType,
    elderStatus: patch.elderStatus ?? existing.elderStatus,
    content: patch.content ?? existing.content,
    newInfo: patch.newInfo ?? existing.newInfo,
    nextSuggestion: patch.nextSuggestion ?? existing.nextSuggestion,
    durationHours: patch.durationHours ?? existing.durationHours,
    durationStatus: patch.durationStatus ?? existing.durationStatus,
    confirmedBy: patch.confirmedBy ?? existing.confirmedBy,
    confirmedAt: patch.confirmedAt ?? existing.confirmedAt,
    generatedOpportunities: patch.generatedOpportunities ?? existing.generatedOpportunities,
    aiSuggestedTags: patch.aiSuggestedTags ?? existing.aiSuggestedTags,
    operatorName: patch.operatorName ?? existing.operatorName,
    updatedAt: patch.updatedAt || new Date().toISOString(),
  });

  saveServiceRecords(records.map((record) => (record.id === recordId ? nextRecord : record)));

  const elder = getElderById(nextRecord.elderId);
  if (elder && patch.nextSuggestion) {
    saveElder({
      ...elder,
      nextSuggestion: patch.nextSuggestion,
      updatedAt: nextRecord.updatedAt,
    });
  }

  return nextRecord;
}

export function deleteServiceRecord(recordId) {
  const records = getRecords();
  const nextRecords = records.filter((record) => record.id !== recordId);
  if (nextRecords.length === records.length) {
    throw new Error("Service record not found.");
  }

  saveServiceRecords(nextRecords);
  return true;
}

export function buildDashboardData() {
  const elders = getElders();
  const opportunities = getOpportunities();
  const records = getRecords();

  return {
    focusElder: elders[0],
    topOpportunities: opportunities.slice(0, 3),
    recentRecords: records.slice(0, 2),
    elders,
    opportunities,
    records,
  };
}


