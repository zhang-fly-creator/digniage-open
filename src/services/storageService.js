import { defaultAppData } from "../data/defaultData";
import { getIdCardLast4, normalizeIdCardNumber } from "../utils/privacy";
import { normalizeDurationHours, normalizeDurationStatus } from "../utils/serviceDuration";

export const APP_STORAGE_KEY = "zhilao_app_data";
export const STAFF_ONBOARDING_DISMISSED_KEY = "zhilao_staff_onboarding_dismissed";
export const VOLUNTEER_ONBOARDING_DISMISSED_KEY = "zhilao_volunteer_onboarding_dismissed";
export const HOME_DASHBOARD_SNAPSHOT_KEY = "zhilao_home_dashboard_snapshot";
export const ELDER_FORM_DRAFT_NEW_KEY = "zhilao_elder_form_draft_new";

const LEGACY_KEYS = {
  elders: "knowelder:elders",
  serviceOpportunities: "knowelder:opportunities",
  serviceRecords: "knowelder:records",
  organizations: "knowelder:organizations",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(key, fallback = null) {
  if (typeof localStorage === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStaffOnboardingDismissed() {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(STAFF_ONBOARDING_DISMISSED_KEY) === "true";
}

export function setStaffOnboardingDismissed(dismissed) {
  if (typeof localStorage === "undefined") return;
  if (dismissed) {
    localStorage.setItem(STAFF_ONBOARDING_DISMISSED_KEY, "true");
    return;
  }
  localStorage.removeItem(STAFF_ONBOARDING_DISMISSED_KEY);
}

export function getVolunteerOnboardingDismissed() {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(VOLUNTEER_ONBOARDING_DISMISSED_KEY) === "true";
}

export function setVolunteerOnboardingDismissed(dismissed) {
  if (typeof localStorage === "undefined") return;
  if (dismissed) {
    localStorage.setItem(VOLUNTEER_ONBOARDING_DISMISSED_KEY, "true");
    return;
  }
  localStorage.removeItem(VOLUNTEER_ONBOARDING_DISMISSED_KEY);
}

export function getHomeDashboardSnapshot() {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(HOME_DASHBOARD_SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function setHomeDashboardSnapshot(snapshot) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(HOME_DASHBOARD_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore snapshot write failures. Dashboard should continue to work without cache.
  }
}

export function deriveBirthdayMonthDay(value) {
  const normalized = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized.slice(5);
  if (/^\d{2}-\d{2}$/.test(normalized)) return normalized;
  return "";
}

export function resolveElderBirthdayMonthDay(elder = {}) {
  return (
    deriveBirthdayMonthDay(elder.birthDate) ||
    deriveBirthdayMonthDay(elder.birthday) ||
    deriveBirthdayMonthDay(elder.careDate)
  );
}

export function getElderFormDraftKey(elderId) {
  return elderId ? `zhilao_elder_form_draft_${elderId}` : ELDER_FORM_DRAFT_NEW_KEY;
}

export function getElderFormDraft(elderId) {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(getElderFormDraftKey(elderId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function setElderFormDraft(elderId, draft) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(getElderFormDraftKey(elderId), JSON.stringify(draft));
  } catch {
    // Ignore draft write failures to avoid blocking form editing.
  }
}

export function clearElderFormDraft(elderId) {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(getElderFormDraftKey(elderId));
}

function normalizeOrganization(organization = {}) {
  return {
    id: organization.id || defaultAppData.currentOrganizationId,
    name: organization.name || "",
    type: organization.type || "",
    city: organization.city || "",
    contactName: organization.contactName || "",
    contactPhone: organization.contactPhone || "",
    description: organization.description || "",
  };
}

export function buildCandidateOpportunityId() {
  return `candidate_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeGeneratedOpportunityItem(item = {}) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;

  const type = String(item.type || "").trim();
  const title = String(item.title || "").trim();
  const description = String(item.description || "").trim();

  if (!type && !title && !description) return null;

  const reviewStatus =
    item.reviewStatus === "confirmed" || item.reviewStatus === "ignored"
      ? item.reviewStatus
      : "candidate";

  return {
    id: String(item.id || "").trim() || buildCandidateOpportunityId(),
    type,
    title,
    description,
    reviewStatus,
    confirmedOpportunityId: item.confirmedOpportunityId || null,
    confirmedAt: item.confirmedAt || null,
    ignoredAt: item.ignoredAt || null,
  };
}

export function normalizeGeneratedOpportunities(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeGeneratedOpportunityItem(item)).filter(Boolean);
}

function normalizeMember(member = {}) {
  return {
    id: member.id || `member-${Date.now()}`,
    userId: member.userId || defaultAppData.currentUser.id,
    organizationId: member.organizationId || defaultAppData.currentOrganizationId,
    email: member.email || "",
    name: member.name || "",
    role: member.role || "staff",
    roleName: member.roleName || "服务人员",
    status: member.status || "active",
  };
}

function normalizeElder(elder = {}, organizationId) {
  const legacyBirthDate = /^\d{4}-\d{2}-\d{2}$/.test(elder.birthday || "")
    ? elder.birthday
    : "";
  const normalizedBirthday = resolveElderBirthdayMonthDay(elder);
  const normalizedIdCardNumber = normalizeIdCardNumber(elder.idCardNumber);
  return {
    ...elder,
    organizationId: elder.organizationId || organizationId,
    birthDate: elder.birthDate || legacyBirthDate || "",
    phone: elder.phone || "",
    emergencyContactName: elder.emergencyContactName || "",
    emergencyContactPhone: elder.emergencyContactPhone || "",
    emergencyContactRelationship: elder.emergencyContactRelationship || "",
    address: elder.address || "",
    storeName: elder.storeName || "",
    contactNote: elder.contactNote || "",
    otherContactInfo: elder.otherContactInfo || "",
    healthCondition: elder.healthCondition || "",
    careNotesPublic: elder.careNotesPublic || "",
    privateNotes: elder.privateNotes || "",
    birthday: elder.birthday || normalizedBirthday,
    careDate: elder.careDate || "",
    idCardNumber: normalizedIdCardNumber,
    idCardLast4: elder.idCardLast4 || getIdCardLast4(normalizedIdCardNumber),
    idCardUpdatedAt: elder.idCardUpdatedAt || "",
    idCardUpdatedBy: elder.idCardUpdatedBy || "",
    status: elder.status === "archived" ? "archived" : "active",
    archivedAt: elder.archivedAt || "",
    archivedReason: elder.archivedReason || "",
  };
}

function normalizeOpportunity(opportunity = {}, organizationId) {
  const status =
    opportunity.status === "completed" || opportunity.status === "done"
      ? "completed"
      : opportunity.status === "dismissed"
        ? "dismissed"
        : "pending";

  return {
    ...opportunity,
    organizationId: opportunity.organizationId || organizationId,
    elderId: opportunity.elderId || "",
    status,
    source:
      opportunity.source === "manual"
        ? "manual"
        : opportunity.source === "ai_record_analysis"
          ? "ai"
          : opportunity.source === "ai" ||
              opportunity.source === "AI建议" ||
              opportunity.source === "AI发现"
            ? "ai"
            : "rule",
    createdByUserId: opportunity.createdByUserId || "",
    createdByName: opportunity.createdByName || "",
    createdByRole: opportunity.createdByRole || "",
    assignedToUserId: opportunity.assignedToUserId || "",
    assignedToMemberId: opportunity.assignedToMemberId || "",
    assignedToName: opportunity.assignedToName || "",
    assignedRole: opportunity.assignedRole || "",
    assignedAt: opportunity.assignedAt || "",
    assignedBy: opportunity.assignedBy || "",
    createdAt: opportunity.createdAt || "",
    updatedAt: opportunity.updatedAt || "",
    completedAt: opportunity.completedAt || "",
    relatedRecordId: opportunity.relatedRecordId || "",
    dismissReason: opportunity.dismissReason || "",
    dismissedAt: opportunity.dismissedAt || "",
    isDemo: Boolean(opportunity.isDemo || opportunity.sample),
  };
}

function normalizeRecord(record = {}, organizationId) {
  return {
    ...record,
    organizationId: record.organizationId || organizationId,
    relatedOpportunityId: record.relatedOpportunityId || "",
    durationHours: normalizeDurationHours(record.durationHours),
    durationStatus: normalizeDurationStatus(record.durationStatus),
    confirmedBy: record.confirmedBy || "",
    confirmedAt: record.confirmedAt || "",
    generatedOpportunities: normalizeGeneratedOpportunities(record.generatedOpportunities),
  };
}

function normalizeNewsPost(post = {}, organizationId) {
  return {
    ...post,
    id: post.id || `news-${Date.now()}`,
    organizationId: post.scope === "platform" ? "" : post.organizationId || organizationId,
    scope: post.scope === "platform" ? "platform" : "organization",
    title: post.title || "",
    summary: post.summary || "",
    content: post.content || "",
    category: post.category || "��̬",
    status: post.status || "published",
    coverImageUrl: post.coverImageUrl || "",
    authorId: post.authorId || "",
    authorName: post.authorName || "",
    publishedAt: post.publishedAt || post.createdAt || "",
    createdAt: post.createdAt || "",
    updatedAt: post.updatedAt || "",
  };
}

function mergeById(defaultItems, storedItems, normalizer, organizationId) {
  const defaults = Array.isArray(defaultItems) ? defaultItems : [];
  const source = Array.isArray(storedItems) ? storedItems : defaults;
  return source.map((item) => normalizer(item, organizationId));
}

function mergeByIdWithDefaults(defaultItems, storedItems, normalizer, organizationId) {
  const defaults = Array.isArray(defaultItems) ? defaultItems : [];
  const stored = Array.isArray(storedItems) ? storedItems : [];
  const byId = new Map();

  defaults.forEach((item) => {
    byId.set(item.id, normalizer(item, organizationId));
  });
  stored.forEach((item) => {
    byId.set(item.id, normalizer(item, organizationId));
  });

  return [...byId.values()];
}

function migrateLegacyData() {
  return {
    organizations: readJson(LEGACY_KEYS.organizations),
    elders: readJson(LEGACY_KEYS.elders),
    serviceOpportunities: readJson(LEGACY_KEYS.serviceOpportunities),
    serviceRecords: readJson(LEGACY_KEYS.serviceRecords),
  };
}

function normalizeAppData(data = {}) {
  const legacy = migrateLegacyData();
  const base = clone(defaultAppData);
  const currentOrganizationId =
    data.currentOrganizationId ||
    base.currentOrganizationId ||
    "org_demo";

  return {
    currentUser: {
      ...base.currentUser,
      ...(data.currentUser || {}),
    },
    currentOrganizationId,
    organizations: mergeById(
      base.organizations,
      data.organizations || legacy.organizations,
      (item) => normalizeOrganization(item),
      currentOrganizationId
    ),
    organizationMembers: mergeById(
      base.organizationMembers,
      data.organizationMembers,
      (item) => normalizeMember(item),
      currentOrganizationId
    ),
    elders: mergeById(
      base.elders,
      data.elders || legacy.elders,
      normalizeElder,
      currentOrganizationId
    ),
    serviceOpportunities: mergeByIdWithDefaults(
      base.serviceOpportunities,
      data.serviceOpportunities || legacy.serviceOpportunities,
      normalizeOpportunity,
      currentOrganizationId
    ),
    serviceRecords: mergeById(
      base.serviceRecords,
      data.serviceRecords || legacy.serviceRecords,
      normalizeRecord,
      currentOrganizationId
    ),
    newsPosts: mergeById(
      base.newsPosts,
      data.newsPosts,
      normalizeNewsPost,
      currentOrganizationId
    ),
  };
}

export function getAppData() {
  const stored = readJson(APP_STORAGE_KEY, null);
  const normalized = normalizeAppData(stored || {});
  writeJson(APP_STORAGE_KEY, normalized);
  return normalized;
}

export function saveAppData(data) {
  const normalized = normalizeAppData(data);
  writeJson(APP_STORAGE_KEY, normalized);
  return normalized;
}

function updateAppData(updater) {
  const data = getAppData();
  return saveAppData(updater(data));
}

export function getCurrentUser() {
  return getAppData().currentUser;
}

export function getCurrentOrganization() {
  const data = getAppData();
  return (
    data.organizations.find((item) => item.id === data.currentOrganizationId) ||
    data.organizations[0]
  );
}

export function getCurrentMembership() {
  const data = getAppData();
  return data.organizationMembers.find(
    (member) =>
      member.userId === data.currentUser.id &&
      member.organizationId === data.currentOrganizationId &&
      member.status === "active"
  );
}

export function getOrganizationMembers() {
  const data = getAppData();
  return data.organizationMembers.filter(
    (member) => member.organizationId === data.currentOrganizationId
  );
}

export function getElders() {
  return getAppData().elders;
}

export function buildElderPreview(elder = {}) {
  return {
    id: elder.id || "",
    name: elder.name || "",
    age: elder.age ?? "",
    birthDate: elder.birthDate || "",
    gender: elder.gender || "",
    nickname: elder.nickname || "",
    summary: elder.summary || "",
    tags: Array.isArray(elder.tags) ? elder.tags : [],
    avatar: elder.avatar || "",
    avatarUrl: elder.avatarUrl || "",
    avatarDataUrl: elder.avatarDataUrl || "",
    updatedAt: elder.updatedAt || "",
    status: elder.status || "active",
  };
}

export function getElderPreviewById(elderId) {
  if (!elderId) return null;
  const elder = getElders().find((item) => item.id === elderId);
  return elder ? buildElderPreview(elder) : null;
}

export function saveElders(elders) {
  return updateAppData((data) => ({ ...data, elders })).elders;
}

export function updateElder(elderId, patch) {
  return updateAppData((data) => ({
    ...data,
    elders: data.elders.map((elder) =>
      elder.id === elderId
        ? normalizeElder({ ...elder, ...patch }, data.currentOrganizationId)
        : elder
    ),
  })).elders.find((elder) => elder.id === elderId);
}

export function archiveElder(elderId, reason) {
  return updateElder(elderId, {
    status: "archived",
    archivedAt: new Date().toISOString(),
    archivedReason: reason,
    updatedAt: new Date().toISOString(),
  });
}

export function restoreElder(elderId) {
  return updateElder(elderId, {
    status: "active",
    archivedAt: "",
    archivedReason: "",
    updatedAt: new Date().toISOString(),
  });
}

export function getServiceOpportunities() {
  return getAppData().serviceOpportunities;
}

export function saveServiceOpportunities(serviceOpportunities) {
  return updateAppData((data) => ({ ...data, serviceOpportunities }))
    .serviceOpportunities;
}

export function updateServiceOpportunity(opportunityId, patch) {
  return updateAppData((data) => ({
    ...data,
    serviceOpportunities: data.serviceOpportunities.map((opportunity) =>
      opportunity.id === opportunityId
        ? normalizeOpportunity(
            { ...opportunity, ...patch },
            data.currentOrganizationId
          )
        : opportunity
    ),
  })).serviceOpportunities.find((opportunity) => opportunity.id === opportunityId);
}
export function createServiceOpportunity(input) {
  const data = getAppData();
  const now = new Date().toISOString();
  const nextOpportunity = normalizeOpportunity(
    {
      ...input,
      id: input.id || `op-${Date.now()}`,
      organizationId: input.organizationId || data.currentOrganizationId,
      status: input.status || "pending",
      source: input.source || "manual",
      createdByUserId: input.createdByUserId || "",
      createdByName: input.createdByName || "",
      createdByRole: input.createdByRole || "",
      assignedToUserId: input.assignedToUserId || "",
      assignedToMemberId: input.assignedToMemberId || "",
      assignedToName: input.assignedToName || "",
      assignedRole: input.assignedRole || "",
      assignedAt: input.assignedAt || "",
      assignedBy: input.assignedBy || "",
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
      completedAt: input.completedAt || "",
      relatedRecordId: input.relatedRecordId || "",
      dismissReason: "",
      dismissedAt: "",
    },
    data.currentOrganizationId
  );

  saveAppData({
    ...data,
    serviceOpportunities: [nextOpportunity, ...data.serviceOpportunities],
  });

  return nextOpportunity;
}

export function dismissServiceOpportunity(opportunityId, reason) {
  return updateServiceOpportunity(opportunityId, {
    status: "dismissed",
    dismissReason: reason,
    dismissedAt: new Date().toISOString(),
  });
}

export function completeServiceOpportunity(opportunityId, relatedRecordId) {
  return updateServiceOpportunity(opportunityId, {
    status: "completed",
    completedAt: new Date().toISOString(),
    relatedRecordId,
    dismissReason: "",
    dismissedAt: "",
  });
}

export function getServiceRecords() {
  return getAppData().serviceRecords;
}

export function saveServiceRecords(serviceRecords) {
  return updateAppData((data) => ({ ...data, serviceRecords })).serviceRecords;
}

export function addServiceRecord(record) {
  const data = getAppData();
  const normalized = normalizeRecord(record, data.currentOrganizationId);
  saveAppData({
    ...data,
    serviceRecords: [normalized, ...data.serviceRecords],
  });
  return normalized;
}

export function updateServiceRecord(recordId, patch) {
  return updateAppData((data) => ({
    ...data,
    serviceRecords: data.serviceRecords.map((record) =>
      record.id === recordId
        ? normalizeRecord({ ...record, ...patch }, data.currentOrganizationId)
        : record
    ),
  })).serviceRecords.find((record) => record.id === recordId);
}

export function deleteServiceRecord(recordId) {
  const before = getServiceRecords();
  const nextRecords = before.filter((record) => record.id !== recordId);
  if (nextRecords.length === before.length) return false;
  saveServiceRecords(nextRecords);
  return true;
}

export function getNewsPosts() {
  const data = getAppData();
  return data.newsPosts
    .filter(
      (post) =>
        post.status === "published" &&
        (post.scope === "platform" || post.organizationId === data.currentOrganizationId)
    )
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
}

export function getHomeNewsPosts(limit = 3) {
  return getNewsPosts().slice(0, limit);
}

export function getNewsPostById(id) {
  return getNewsPosts().find((post) => post.id === id) || null;
}

export function getOrganizationNewsPosts() {
  const data = getAppData();
  return data.newsPosts
    .filter(
      (post) =>
        post.scope === "organization" &&
        post.organizationId === data.currentOrganizationId &&
        ["published", "archived"].includes(post.status)
    )
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
}

export function createOrganizationNewsPost(input) {
  const data = getAppData();
  const now = new Date().toISOString();
  const normalized = normalizeNewsPost(
    {
      ...input,
      id: input.id || `news-${Date.now()}`,
      organizationId: data.currentOrganizationId,
      scope: "organization",
      status: "published",
      authorId: input.authorId || data.currentUser.id,
      authorName: input.authorName || data.currentUser.name || data.currentUser.email,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    data.currentOrganizationId
  );
  saveAppData({ ...data, newsPosts: [normalized, ...data.newsPosts] });
  return normalized;
}

export function updateOrganizationNewsPost(id, input) {
  return updateAppData((data) => ({
    ...data,
    newsPosts: data.newsPosts.map((post) =>
      post.id === id && post.scope === "organization" && post.organizationId === data.currentOrganizationId
        ? normalizeNewsPost({ ...post, ...input, scope: "organization", updatedAt: new Date().toISOString() }, data.currentOrganizationId)
        : post
    ),
  })).newsPosts.find((post) => post.id === id);
}

export function archiveOrganizationNewsPost(id) {
  return updateOrganizationNewsPost(id, { status: "archived" });
}

export function updateOrganization(organizationId, patch) {
  return updateAppData((data) => ({
    ...data,
    organizations: data.organizations.map((organization) =>
      organization.id === organizationId
        ? normalizeOrganization({ ...organization, ...patch, id: organizationId })
        : organization
    ),
  })).organizations.find((organization) => organization.id === organizationId);
}

export function isValidAppDataShape(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.currentUser &&
      typeof value.currentUser === "object" &&
      typeof value.currentOrganizationId === "string" &&
      Array.isArray(value.organizations) &&
      Array.isArray(value.organizationMembers) &&
      Array.isArray(value.elders) &&
      Array.isArray(value.serviceOpportunities) &&
      Array.isArray(value.serviceRecords) &&
      Array.isArray(value.newsPosts)
  );
}

export function importAppData(data) {
  if (!isValidAppDataShape(data)) {
    throw new Error("Invalid zhilao app data");
  }

  return saveAppData(data);
}


