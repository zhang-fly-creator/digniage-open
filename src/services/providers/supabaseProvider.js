import { isSupabaseConfigured, supabase } from "../../lib/supabaseClient";
import { getSupabaseAuthContext } from "../authService";
import {
  getAppData,
  normalizeGeneratedOpportunities,
  resolveElderBirthdayMonthDay,
} from "../storageService";
import { normalizeDurationHours, normalizeDurationStatus } from "../../utils/serviceDuration";
import {
  canEditElderSensitiveInfo as canEditSensitiveInfoByRole,
  canViewElderSensitiveInfo as canViewSensitiveInfoByRole,
  getIdCardLast4,
  normalizeIdCardNumber,
} from "../../utils/privacy";
import { getChineseElderAvatar } from "../../utils/avatars";

function notImplemented(methodName) {
  throw new Error(
    `Supabase provider method "${methodName}" is not implemented in v1.4. Current release only prepares the database layer.`
  );
}

function assertConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
}

function logSupabaseError({ table, userId, organizationId, error }) {
  console.error("[Supabase query failed]", {
    table,
    userId: userId || "",
    organizationId: organizationId || "",
    message: error?.message || String(error || ""),
  });
}

function logSupabaseQuery({ table, userId, organizationId }) {
  if (!import.meta.env.DEV) return;
  console.debug("[Supabase query]", {
    table,
    userId: userId || "",
    organizationId: organizationId || "",
  });
}

function mapOrganizationFromSupabase(row = {}) {
  return {
    id: row.id || "",
    name: row.name || "",
    type: row.type || "",
    city: row.city || "",
    contactName: row.contact_name || "",
    contactPhone: row.contact_phone || "",
    description: row.description || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function mapOrganizationPatchToSupabase(patch = {}) {
  const next = {};

  if ("name" in patch) next.name = patch.name;
  if ("type" in patch) next.type = patch.type;
  if ("city" in patch) next.city = patch.city;
  if ("contactName" in patch) next.contact_name = patch.contactName;
  if ("contactPhone" in patch) next.contact_phone = patch.contactPhone;
  if ("description" in patch) next.description = patch.description;

  next.updated_at = new Date().toISOString();
  return next;
}

function normalizeJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    return value
      .split(/[,ï¼Œã€?\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function mapElderFromSupabase(row = {}) {
  const avatarDataUrl = row.avatar_data_url || "";
  const avatarUrl = row.avatar_url || "";
  const legacyBirthDate = /^\d{4}-\d{2}-\d{2}$/.test(row.birthday || "") ? row.birthday : "";

  return {
    id: row.id || "",
    organizationId: row.organization_id || "",
    name: row.name || "",
    age: row.age ?? "",
    birthDate: row.birth_date || legacyBirthDate || "",
    phone: row.phone || "",
    emergencyContactName: row.emergency_contact_name || "",
    emergencyContactPhone: row.emergency_contact_phone || "",
    emergencyContactRelationship: row.emergency_contact_relationship || "",
    address: row.address || "",
    storeName: row.store_name || "",
    contactNote: row.contact_note || "",
    otherContactInfo: row.other_contact_info || "",
    healthCondition: row.health_condition || "",
    careNotesPublic: row.care_notes_public || "",
    privateNotes: row.private_notes || "",
    gender: row.gender || "",
    nickname: row.nickname || "",
    birthday: row.birthday || resolveElderBirthdayMonthDay({ birthDate: row.birth_date, birthday: row.birthday }),
    careDate: "",
    avatarUrl,
    avatarDataUrl,
    avatar: avatarDataUrl || avatarUrl || getChineseElderAvatar(row.id || row.name, row.gender),
    formerJob: row.former_job || "",
    lifeExperience: row.life_experience || "",
    interests: row.interests || "",
    favoriteTopics: row.favorite_topics || [],
    avoidTopics: row.avoid_topics || [],
    communicationStyle: row.communication_style || "",
    familyNote: row.family_note || "",
    careNoteInput: row.care_note_input || "",
    staffNote: row.staff_note || "",
    summary: row.summary || "",
    tags: row.tags || [],
    communicationAdvice: row.communication_advice || "",
    careNote: row.care_note || "",
    nextSuggestion: row.next_suggestion || "",
    status: row.status === "archived" ? "archived" : "active",
    archivedAt: row.archived_at || "",
    archivedReason: row.archived_reason || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function mapElderPatchToSupabase(input = {}, organizationId) {
  const next = {};

  if (organizationId) next.organization_id = organizationId;
  if ("name" in input) next.name = input.name;
  if ("birthDate" in input) next.birth_date = input.birthDate || null;
  if ("phone" in input) next.phone = input.phone;
  if ("emergencyContactName" in input) next.emergency_contact_name = input.emergencyContactName;
  if ("emergencyContactPhone" in input) next.emergency_contact_phone = input.emergencyContactPhone;
  if ("emergencyContactRelationship" in input) {
    next.emergency_contact_relationship = input.emergencyContactRelationship;
  }
  if ("address" in input) next.address = input.address;
  if ("storeName" in input) next.store_name = input.storeName || null;
  if ("contactNote" in input) next.contact_note = input.contactNote || null;
  if ("otherContactInfo" in input) next.other_contact_info = input.otherContactInfo || null;
  if ("healthCondition" in input) next.health_condition = input.healthCondition;
  if ("careNotesPublic" in input) next.care_notes_public = input.careNotesPublic;
  if ("privateNotes" in input) next.private_notes = input.privateNotes;
  if ("gender" in input) next.gender = input.gender;
  if ("nickname" in input) next.nickname = input.nickname;
  if ("birthday" in input) next.birthday = input.birthday || resolveElderBirthdayMonthDay(input) || null;
  else if ("birthDate" in input) next.birthday = resolveElderBirthdayMonthDay(input) || null;
  if ("avatarUrl" in input) next.avatar_url = input.avatarUrl || null;
  if ("avatarDataUrl" in input) next.avatar_data_url = input.avatarDataUrl || null;
  if ("avatar" in input && !("avatarDataUrl" in input)) {
    next.avatar_data_url = input.avatar || null;
  }
  if ("formerJob" in input) next.former_job = input.formerJob;
  if ("lifeExperience" in input) next.life_experience = input.lifeExperience;
  if ("interests" in input) next.interests = input.interests;
  if ("favoriteTopics" in input) next.favorite_topics = normalizeJsonArray(input.favoriteTopics);
  if ("avoidTopics" in input) next.avoid_topics = normalizeJsonArray(input.avoidTopics);
  if ("communicationStyle" in input) next.communication_style = input.communicationStyle;
  if ("familyNote" in input) next.family_note = input.familyNote;
  if ("careNoteInput" in input) next.care_note_input = input.careNoteInput;
  if ("staffNote" in input) next.staff_note = input.staffNote;
  if ("summary" in input) next.summary = input.summary;
  if ("tags" in input) next.tags = normalizeJsonArray(input.tags);
  if ("communicationAdvice" in input) next.communication_advice = input.communicationAdvice;
  if ("careNote" in input) next.care_note = input.careNote;
  if ("nextSuggestion" in input) next.next_suggestion = input.nextSuggestion || null;
  if ("status" in input) next.status = input.status || "active";
  if ("archivedAt" in input) next.archived_at = input.archivedAt || null;
  if ("archivedReason" in input) next.archived_reason = input.archivedReason || null;

  next.updated_at = input.updatedAt || new Date().toISOString();
  return next;
}

function mapSensitiveInfoRow(row = {}) {
  return {
    elderId: row.elder_id || "",
    idCardNumber: row.id_card_number || "",
    idCardLast4: row.id_card_last4 || "",
    idCardUpdatedAt: row.updated_at || "",
    idCardUpdatedBy: row.updated_by || "",
  };
}

function mergeElderWithSensitive(elder = {}, sensitive = null) {
  if (!sensitive) return elder;
  return {
    ...elder,
    idCardNumber: sensitive.idCardNumber || "",
    idCardLast4: sensitive.idCardLast4 || "",
    idCardUpdatedAt: sensitive.idCardUpdatedAt || "",
    idCardUpdatedBy: sensitive.idCardUpdatedBy || "",
  };
}

function mapOpportunityFromSupabase(row = {}) {
  return {
    id: row.id || "",
    organizationId: row.organization_id || "",
    elderId: row.elder_id || "",
    type: row.type || "",
    title: row.title || "",
    description: row.description || "",
    source:
      row.source === "manual"
        ? "manual"
        : row.source === "ai_record_analysis"
          ? "ai"
          : row.source === "ai" || row.source === "AIå»ºè®®" || row.source === "AIå‘çŽ°"
            ? "ai"
            : "rule",
    createdByUserId: row.created_by_user_id || "",
    createdByName: row.created_by_name || "",
    createdByRole: row.created_by_role || "",
    assignedToUserId: row.assigned_to_user_id || "",
    assignedToMemberId: row.assigned_to_member_id || "",
    assignedToName: row.assigned_to_name || "",
    assignedRole: row.assigned_role || "",
    assignedAt: row.assigned_at || "",
    assignedBy: row.assigned_by || "",
    status:
      row.status === "completed" || row.status === "dismissed"
        ? row.status
        : "pending",
    dueDate: row.due_date || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    completedAt: row.completed_at || "",
    relatedRecordId: row.related_record_id || "",
    dismissReason: row.dismiss_reason || "",
    dismissedAt: row.dismissed_at || "",
  };
}

function mapOpportunityPatchToSupabase(input = {}, organizationId) {
  const next = {};

  if (organizationId) next.organization_id = organizationId;
  if ("elderId" in input) next.elder_id = input.elderId || null;
  if ("type" in input) next.type = input.type;
  if ("title" in input) next.title = input.title;
  if ("description" in input) next.description = input.description;
  if ("source" in input) {
    next.source =
      input.source === "manual"
        ? "manual"
        : input.source === "ai_record_analysis"
          ? "ai"
          : input.source === "ai"
            ? "ai"
            : "rule";
  }
  if ("createdByUserId" in input) next.created_by_user_id = input.createdByUserId || null;
  if ("createdByName" in input) next.created_by_name = input.createdByName || null;
  if ("createdByRole" in input) next.created_by_role = input.createdByRole || null;
  if ("assignedToUserId" in input) next.assigned_to_user_id = input.assignedToUserId || null;
  if ("assignedToMemberId" in input) next.assigned_to_member_id = input.assignedToMemberId || null;
  if ("assignedToName" in input) next.assigned_to_name = input.assignedToName || null;
  if ("assignedRole" in input) next.assigned_role = input.assignedRole || null;
  if ("assignedAt" in input) next.assigned_at = input.assignedAt || null;
  if ("assignedBy" in input) next.assigned_by = input.assignedBy || null;
  if ("status" in input) next.status = input.status || "pending";
  if ("dueDate" in input) next.due_date = input.dueDate || null;
  if ("completedAt" in input) next.completed_at = input.completedAt || null;
  if ("relatedRecordId" in input) next.related_record_id = input.relatedRecordId || null;
  if ("dismissReason" in input) next.dismiss_reason = input.dismissReason || null;
  if ("dismissedAt" in input) next.dismissed_at = input.dismissedAt || null;

  next.updated_at = input.updatedAt || new Date().toISOString();
  return next;
}

function mapRecordFromSupabase(row = {}) {
  return {
    id: row.id || "",
    organizationId: row.organization_id || "",
    elderId: row.elder_id || "",
    relatedOpportunityId: row.related_opportunity_id || "",
    serviceType: row.service_type || "",
    elderStatus: row.elder_status || "",
    content: row.content || "",
    newInfo: row.new_info || "",
    nextSuggestion: row.next_suggestion || "",
    generatedOpportunities: normalizeGeneratedOpportunities(row.generated_opportunities),
    durationHours: normalizeDurationHours(row.duration_hours),
    durationStatus: normalizeDurationStatus(row.duration_status),
    confirmedBy: row.confirmed_by || "",
    confirmedAt: row.confirmed_at || "",
    operatorName: row.operator_name || "",
    operatorId: row.operator_id || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function mapRecordPatchToSupabase(input = {}, organizationId) {
  const next = {};

  if (organizationId) next.organization_id = organizationId;
  if ("elderId" in input) next.elder_id = input.elderId || null;
  if ("relatedOpportunityId" in input) next.related_opportunity_id = input.relatedOpportunityId || null;
  if ("serviceType" in input) next.service_type = input.serviceType;
  if ("elderStatus" in input) next.elder_status = input.elderStatus;
  if ("content" in input) next.content = input.content;
  if ("newInfo" in input) next.new_info = input.newInfo;
  if ("nextSuggestion" in input) next.next_suggestion = input.nextSuggestion || "";
  if ("generatedOpportunities" in input) {
    next.generated_opportunities = normalizeGeneratedOpportunities(input.generatedOpportunities);
  }
  if ("durationHours" in input) next.duration_hours = normalizeDurationHours(input.durationHours);
  if ("durationStatus" in input) next.duration_status = normalizeDurationStatus(input.durationStatus);
  if ("confirmedBy" in input) next.confirmed_by = input.confirmedBy || null;
  if ("confirmedAt" in input) next.confirmed_at = input.confirmedAt || null;
  if ("operatorName" in input) next.operator_name = input.operatorName;
  if ("operatorId" in input) next.operator_id = input.operatorId || null;

  const now = new Date().toISOString();
  next.created_at = input.createdAt || now;
  next.updated_at = input.updatedAt || now;
  return next;
}

function mapNewsPostFromSupabase(row = {}) {
  return {
    id: row.id || "",
    organizationId: row.organization_id || "",
    scope: row.scope === "platform" ? "platform" : "organization",
    title: row.title || "",
    summary: row.summary || "",
    content: row.content || "",
    category: row.category || "¶¯Ì¬",
    status: row.status || "published",
    coverImageUrl: row.cover_image_url || "",
    authorId: row.author_id || "",
    authorName: row.author_name || "",
    publishedAt: row.published_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function mapNewsPostPatchToSupabase(input = {}, organizationId) {
  const next = {};

  if (organizationId) next.organization_id = organizationId;
  if ("scope" in input) next.scope = input.scope === "platform" ? "platform" : "organization";
  if ("title" in input && input.title !== undefined) next.title = input.title;
  if ("summary" in input && input.summary !== undefined) next.summary = input.summary || null;
  if ("content" in input && input.content !== undefined) next.content = input.content;
  if ("category" in input && input.category !== undefined) next.category = input.category || "¶¯Ì¬";
  if ("status" in input && input.status !== undefined) next.status = input.status || "published";
  if ("coverImageUrl" in input) next.cover_image_url = input.coverImageUrl || null;
  if ("authorId" in input) next.author_id = input.authorId || null;
  if ("authorName" in input) next.author_name = input.authorName || null;
  if ("publishedAt" in input) next.published_at = input.publishedAt || null;
  if ("createdAt" in input) next.created_at = input.createdAt || new Date().toISOString();
  next.updated_at = input.updatedAt || new Date().toISOString();

  return next;
}

async function getCurrentSupabaseOrganizationId() {
  const organization = await supabaseProvider.getCurrentOrganization();
  if (!organization?.id) {
    throw new Error("Current organization is missing. Cannot read Supabase data.");
  }
  return organization.id;
}

async function readOrganizationById(organizationId) {
  if (!organizationId) return null;
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(organizationId)) return null;

  const { data, error } = await supabase
    .from("organizations")
    .select("id,name,type,city,contact_name,contact_phone,description,created_at,updated_at")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Read current organization failed: ${error.message}`);
  }

  return data ? mapOrganizationFromSupabase(data) : null;
}

async function runQuery(query, label, context = {}) {
  if (context.table) {
    logSupabaseQuery(context);
  }
  const { data, error, count } = await query;
  if (error) {
    logSupabaseError({ ...context, error });
    throw new Error(`${label} failed: ${error.message}`);
  }
  return { data, count };
}

async function getSensitiveInfoMap({ elderIds, organizationId, role, userId }) {
  if (!canViewSensitiveInfoByRole(role)) return new Map();
  if (!elderIds?.length) return new Map();
  try {
    const result = await runQuery(
      supabase
        .from("elder_sensitive_info")
        .select("elder_id,id_card_number,id_card_last4,updated_at,updated_by")
        .eq("organization_id", organizationId)
        .in("elder_id", elderIds),
      "Read elder sensitive info",
      { table: "elder_sensitive_info", userId, organizationId }
    );
    return new Map((result.data || []).map((row) => {
      const item = mapSensitiveInfoRow(row);
      return [item.elderId, item];
    }));
  } catch (error) {
    console.warn("[Supabase sensitive info read skipped]", error?.message || error);
    return new Map();
  }
}

async function upsertSensitiveInfo({ elderId, organizationId, userId, role, input }) {
  if (!canEditSensitiveInfoByRole(role)) return null;
  if (!input || !Object.prototype.hasOwnProperty.call(input, "idCardNumber")) return null;
  const normalizedIdCardNumber = normalizeIdCardNumber(input?.idCardNumber);
  const payload = {
    organization_id: organizationId,
    elder_id: elderId,
    id_card_number: normalizedIdCardNumber || null,
    id_card_last4: getIdCardLast4(normalizedIdCardNumber) || null,
    updated_by: userId || null,
    updated_at: input?.idCardUpdatedAt || new Date().toISOString(),
  };
  const result = await runQuery(
    supabase
      .from("elder_sensitive_info")
      .upsert(payload, { onConflict: "elder_id" })
      .select("elder_id,id_card_number,id_card_last4,updated_at,updated_by")
      .single(),
    "Upsert elder sensitive info",
    { table: "elder_sensitive_info", userId, organizationId }
  );
  return mapSensitiveInfoRow(result.data);
}

export const supabaseProvider = {
  async testConnection() {
    assertConfigured();
    const result = await runQuery(
      supabase.from("organizations").select("id", { count: "exact", head: true }),
      "Supabase connection test"
    );
    return {
      ok: true,
      count: result.count ?? 0,
      checkedAt: new Date().toISOString(),
    };
  },

  async getOrganizations() {
    assertConfigured();
    const result = await runQuery(
      supabase
        .from("organizations")
        .select("id,name,type,city,contact_name,contact_phone,description,created_at,updated_at")
        .order("created_at", { ascending: true }),
      "Read organizations"
    );
    return (result.data || []).map(mapOrganizationFromSupabase);
  },

  async updateOrganizationTestRow(organizationId) {
    assertConfigured();
    if (!organizationId) {
      throw new Error("organizationId is required for updateOrganizationTestRow.");
    }
    const updatedAt = new Date().toISOString();
    const result = await runQuery(
      supabase
        .from("organizations")
        .update({ updated_at: updatedAt })
        .eq("id", organizationId)
        .select("id,name,type,city,contact_name,contact_phone,description,created_at,updated_at")
        .single(),
      "Update organization test row"
    );
    return mapOrganizationFromSupabase(result.data);
  },

  async getCurrentUser() {
    const authContext = await getSupabaseAuthContext();
    return authContext.user || null;
  },
  async getCurrentOrganization() {
    assertConfigured();
    const authContext = await getSupabaseAuthContext();
    if (authContext.organization?.id) return authContext.organization;
    if (authContext.membership?.organizationId) {
      const organization = await readOrganizationById(authContext.membership.organizationId);
      if (organization?.id) return organization;
      throw new Error(
        `Read current organization failed: organization ${authContext.membership.organizationId} is not visible to current user.`
      );
    }
    if (authContext.user?.id) {
      throw new Error("Read current organization failed: current user has no active organization membership.");
    }

    const appData = getAppData();
    const byCurrentId = await readOrganizationById(appData.currentOrganizationId);
    if (byCurrentId) return byCurrentId;

    const organizations = await this.getOrganizations();
    const firstOrganization = organizations[0];
    if (!firstOrganization) {
      throw new Error("Read current organization failed: organizations table is empty.");
    }
    return firstOrganization;
  },
  async getCurrentMembership() {
    const authContext = await getSupabaseAuthContext();
    return authContext.membership || null;
  },

  async getElders() {
    assertConfigured();
    const organizationId = await getCurrentSupabaseOrganizationId();
    const authContext = await getSupabaseAuthContext();
    const user = authContext.user || null;
    const role = authContext.membership?.role || "";
    const result = await runQuery(
      supabase
        .from("elders")
        .select(
          "id,organization_id,name,age,birth_date,phone,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship,address,store_name,contact_note,other_contact_info,health_condition,care_notes_public,private_notes,gender,nickname,birthday,avatar_url,avatar_data_url,former_job,life_experience,interests,favorite_topics,avoid_topics,communication_style,family_note,care_note_input,staff_note,summary,tags,communication_advice,care_note,next_suggestion,status,archived_at,archived_reason,created_at,updated_at"
        )
        .eq("organization_id", organizationId)
        .order("updated_at", { ascending: false }),
      "Read elders",
      { table: "elders", userId: user?.id, organizationId }
    );
    const elders = (result.data || []).map(mapElderFromSupabase);
    const sensitiveMap = await getSensitiveInfoMap({
      elderIds: elders.map((item) => item.id),
      organizationId,
      role,
      userId: user?.id,
    });
    return elders.map((elder) => mergeElderWithSensitive(elder, sensitiveMap.get(elder.id) || null));
  },
  async getElderById(id) {
    assertConfigured();
    if (!id) return null;
    const organizationId = await getCurrentSupabaseOrganizationId();
    const authContext = await getSupabaseAuthContext();
    const user = authContext.user || null;
    const role = authContext.membership?.role || "";
    const { data, error } = await supabase
      .from("elders")
      .select(
        "id,organization_id,name,age,birth_date,phone,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship,address,store_name,contact_note,other_contact_info,health_condition,care_notes_public,private_notes,gender,nickname,birthday,avatar_url,avatar_data_url,former_job,life_experience,interests,favorite_topics,avoid_topics,communication_style,family_note,care_note_input,staff_note,summary,tags,communication_advice,care_note,next_suggestion,status,archived_at,archived_reason,created_at,updated_at"
      )
      .eq("id", id)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error) {
      logSupabaseError({ table: "elders", userId: user?.id, organizationId, error });
      throw new Error(`Read elder failed: ${error.message}`);
    }
    if (!data) return null;
    const elder = mapElderFromSupabase(data);
    const sensitiveMap = await getSensitiveInfoMap({
      elderIds: [elder.id],
      organizationId,
      role,
      userId: user?.id,
    });
    return mergeElderWithSensitive(elder, sensitiveMap.get(elder.id) || null);
  },
  async createElder(input) {
    assertConfigured();
    const organizationId = await getCurrentSupabaseOrganizationId();
    const authContext = await getSupabaseAuthContext();
    const user = authContext.user || null;
    const role = authContext.membership?.role || "";
    const now = new Date().toISOString();
    const result = await runQuery(
      supabase
        .from("elders")
        .insert({
          ...mapElderPatchToSupabase(
            {
              ...input,
              status: input.status || "active",
              createdAt: input.createdAt || now,
              updatedAt: input.updatedAt || now,
            },
            organizationId
          ),
          created_at: input.createdAt || now,
        })
        .select(
          "id,organization_id,name,age,birth_date,phone,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship,address,store_name,contact_note,other_contact_info,health_condition,care_notes_public,private_notes,gender,nickname,birthday,avatar_url,avatar_data_url,former_job,life_experience,interests,favorite_topics,avoid_topics,communication_style,family_note,care_note_input,staff_note,summary,tags,communication_advice,care_note,next_suggestion,status,archived_at,archived_reason,created_at,updated_at"
        )
        .single(),
      "Create elder"
    );
    const elder = mapElderFromSupabase(result.data);
    const sensitive = await upsertSensitiveInfo({
      elderId: elder.id,
      organizationId,
      userId: user?.id,
      role,
      input,
    });
    return mergeElderWithSensitive(elder, sensitive);
  },
  async updateElder(id, patch) {
    assertConfigured();
    if (!id) {
      throw new Error("elder id is required for updateElder.");
    }
    const organizationId = await getCurrentSupabaseOrganizationId();
    const authContext = await getSupabaseAuthContext();
    const user = authContext.user || null;
    const role = authContext.membership?.role || "";
    const result = await runQuery(
      supabase
        .from("elders")
        .update(mapElderPatchToSupabase(patch, organizationId))
        .eq("id", id)
        .eq("organization_id", organizationId)
        .select(
          "id,organization_id,name,age,birth_date,phone,emergency_contact_name,emergency_contact_phone,emergency_contact_relationship,address,store_name,contact_note,other_contact_info,health_condition,care_notes_public,private_notes,gender,nickname,birthday,avatar_url,avatar_data_url,former_job,life_experience,interests,favorite_topics,avoid_topics,communication_style,family_note,care_note_input,staff_note,summary,tags,communication_advice,care_note,next_suggestion,status,archived_at,archived_reason,created_at,updated_at"
        )
        .single(),
      "Update elder"
    );
    const elder = mapElderFromSupabase(result.data);
    const sensitive = await upsertSensitiveInfo({
      elderId: elder.id,
      organizationId,
      userId: user?.id,
      role,
      input: patch,
    });
    return mergeElderWithSensitive(elder, sensitive);
  },
  async archiveElder(id, reason) {
    assertConfigured();
    if (!String(reason || "").trim()) {
      throw new Error("archive reason is required.");
    }
    const archivedAt = new Date().toISOString();
    return this.updateElder(id, {
      status: "archived",
      archivedAt,
      archivedReason: reason,
      updatedAt: archivedAt,
    });
  },
  async restoreElder(id) {
    assertConfigured();
    return this.updateElder(id, {
      status: "active",
      archivedAt: "",
      archivedReason: "",
      updatedAt: new Date().toISOString(),
    });
  },

  async getServiceOpportunities() {
    assertConfigured();
    const organizationId = await getCurrentSupabaseOrganizationId();
    if (!organizationId) {
      throw new Error("Read service opportunities failed: organizationId is empty.");
    }
    const user = await this.getCurrentUser();
    const result = await runQuery(
      supabase
        .from("service_opportunities")
        .select(
          "id,organization_id,elder_id,type,title,description,source,created_by_user_id,created_by_name,created_by_role,assigned_to_user_id,assigned_to_member_id,assigned_to_name,assigned_role,assigned_at,assigned_by,status,due_date,created_at,updated_at,completed_at,related_record_id,dismiss_reason,dismissed_at"
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      "Read service opportunities",
      { table: "service_opportunities", userId: user?.id, organizationId }
    );
    return (result.data || []).map(mapOpportunityFromSupabase);
  },
  async getServiceOpportunitiesByElderId(elderId) {
    assertConfigured();
    if (!elderId) return [];
    const organizationId = await getCurrentSupabaseOrganizationId();
    const user = await this.getCurrentUser();
    const result = await runQuery(
      supabase
        .from("service_opportunities")
        .select(
          "id,organization_id,elder_id,type,title,description,source,created_by_user_id,created_by_name,created_by_role,assigned_to_user_id,assigned_to_member_id,assigned_to_name,assigned_role,assigned_at,assigned_by,status,due_date,created_at,updated_at,completed_at,related_record_id,dismiss_reason,dismissed_at"
        )
        .eq("organization_id", organizationId)
        .eq("elder_id", elderId)
        .order("created_at", { ascending: false }),
      "Read elder service opportunities",
      { table: "service_opportunities", userId: user?.id, organizationId }
    );
    return (result.data || []).map(mapOpportunityFromSupabase);
  },
  async createServiceOpportunity(input) {
    assertConfigured();
    const organizationId = await getCurrentSupabaseOrganizationId();
    const now = new Date().toISOString();
    const result = await runQuery(
      supabase
        .from("service_opportunities")
        .insert({
          ...mapOpportunityPatchToSupabase(
            {
              ...input,
              status: input.status || "pending",
              source: input.source || "manual",
              createdAt: input.createdAt || now,
              updatedAt: input.updatedAt || now,
            },
            organizationId
          ),
          created_at: input.createdAt || now,
        })
        .select(
          "id,organization_id,elder_id,type,title,description,source,created_by_user_id,created_by_name,created_by_role,assigned_to_user_id,assigned_to_member_id,assigned_to_name,assigned_role,assigned_at,assigned_by,status,due_date,created_at,updated_at,completed_at,related_record_id,dismiss_reason,dismissed_at"
        )
        .single(),
      "Create service opportunity"
    );
    return mapOpportunityFromSupabase(result.data);
  },
  async updateServiceOpportunity(id, patch) {
    assertConfigured();
    if (!id) throw new Error("opportunity id is required.");
    const organizationId = await getCurrentSupabaseOrganizationId();
    const result = await runQuery(
      supabase
        .from("service_opportunities")
        .update(mapOpportunityPatchToSupabase(patch, organizationId))
        .eq("id", id)
        .eq("organization_id", organizationId)
        .select(
          "id,organization_id,elder_id,type,title,description,source,created_by_user_id,created_by_name,created_by_role,assigned_to_user_id,assigned_to_member_id,assigned_to_name,assigned_role,assigned_at,assigned_by,status,due_date,created_at,updated_at,completed_at,related_record_id,dismiss_reason,dismissed_at"
        )
        .single(),
      "Update service opportunity"
    );
    return mapOpportunityFromSupabase(result.data);
  },
  async dismissServiceOpportunity(id, reason) {
    assertConfigured();
    if (!String(reason || "").trim()) {
      throw new Error("dismiss reason is required.");
    }
    const dismissedAt = new Date().toISOString();
    return this.updateServiceOpportunity(id, {
      status: "dismissed",
      dismissReason: reason,
      dismissedAt,
      updatedAt: dismissedAt,
    });
  },
  async completeServiceOpportunity(id, relatedRecordId) {
    assertConfigured();
    const completedAt = new Date().toISOString();
    return this.updateServiceOpportunity(id, {
      status: "completed",
      completedAt,
      relatedRecordId,
      dismissReason: "",
      dismissedAt: "",
      updatedAt: completedAt,
    });
  },

  async getServiceRecords() {
    assertConfigured();
    const organizationId = await getCurrentSupabaseOrganizationId();
    if (!organizationId) {
      throw new Error("Read service records failed: organizationId is empty.");
    }
    const user = await this.getCurrentUser();
    const result = await runQuery(
      supabase
        .from("service_records")
        .select(
          "id,organization_id,elder_id,related_opportunity_id,service_type,elder_status,content,new_info,next_suggestion,generated_opportunities,duration_hours,duration_status,confirmed_by,confirmed_at,operator_name,operator_id,created_at,updated_at"
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      "Read service records",
      { table: "service_records", userId: user?.id, organizationId }
    );
    return (result.data || []).map(mapRecordFromSupabase);
  },
  async getServiceRecordsByElderId(elderId) {
    assertConfigured();
    if (!elderId) return [];
    const organizationId = await getCurrentSupabaseOrganizationId();
    const user = await this.getCurrentUser();
    const result = await runQuery(
      supabase
        .from("service_records")
        .select(
          "id,organization_id,elder_id,related_opportunity_id,service_type,elder_status,content,new_info,next_suggestion,generated_opportunities,duration_hours,duration_status,confirmed_by,confirmed_at,operator_name,operator_id,created_at,updated_at"
        )
        .eq("organization_id", organizationId)
        .eq("elder_id", elderId)
        .order("created_at", { ascending: false }),
      "Read elder service records",
      { table: "service_records", userId: user?.id, organizationId }
    );
    return (result.data || []).map(mapRecordFromSupabase);
  },
  async addServiceRecord(record) {
    assertConfigured();
    const organizationId = await getCurrentSupabaseOrganizationId();
    const result = await runQuery(
      supabase
        .from("service_records")
        .insert(mapRecordPatchToSupabase(record, organizationId))
        .select(
          "id,organization_id,elder_id,related_opportunity_id,service_type,elder_status,content,new_info,next_suggestion,generated_opportunities,duration_hours,duration_status,confirmed_by,confirmed_at,operator_name,operator_id,created_at,updated_at"
        )
        .single(),
      "Create service record"
    );
    const savedRecord = mapRecordFromSupabase(result.data);
    if (savedRecord.relatedOpportunityId) {
      await this.completeServiceOpportunity(savedRecord.relatedOpportunityId, savedRecord.id);
    }
    return savedRecord;
  },
  async updateServiceRecord(id, patch) {
    assertConfigured();
    if (!id) throw new Error("service record id is required.");
    const organizationId = await getCurrentSupabaseOrganizationId();
    const result = await runQuery(
      supabase
        .from("service_records")
        .update(mapRecordPatchToSupabase(patch, organizationId))
        .eq("id", id)
        .eq("organization_id", organizationId)
        .select(
          "id,organization_id,elder_id,related_opportunity_id,service_type,elder_status,content,new_info,next_suggestion,generated_opportunities,duration_hours,duration_status,confirmed_by,confirmed_at,operator_name,operator_id,created_at,updated_at"
        )
        .single(),
      "Update service record"
    );
    return mapRecordFromSupabase(result.data);
  },
  async deleteServiceRecord(id) {
    assertConfigured();
    if (!id) throw new Error("service record id is required.");
    const organizationId = await getCurrentSupabaseOrganizationId();
    await runQuery(
      supabase
        .from("service_records")
        .delete()
        .eq("id", id)
        .eq("organization_id", organizationId),
      "Delete service record"
    );
    return true;
  },

  async getNewsPosts() {
    assertConfigured();
    const user = await this.getCurrentUser();
    const result = await runQuery(
      supabase
        .from("news_posts")
        .select(
          "id,organization_id,scope,title,summary,content,category,status,cover_image_url,author_id,author_name,published_at,created_at,updated_at"
        )
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
      "Read news posts",
      { table: "news_posts", userId: user?.id, organizationId: "" }
    );
    return (result.data || []).map(mapNewsPostFromSupabase);
  },
  async getHomeNewsPosts(limit = 3) {
    const posts = await this.getNewsPosts();
    return posts.slice(0, limit);
  },
  async getNewsPostById(id) {
    const posts = await this.getNewsPosts();
    return posts.find((post) => post.id === id) || null;
  },
  async getOrganizationNewsPosts() {
    assertConfigured();
    const organizationId = await getCurrentSupabaseOrganizationId();
    const user = await this.getCurrentUser();
    const result = await runQuery(
      supabase
        .from("news_posts")
        .select(
          "id,organization_id,scope,title,summary,content,category,status,cover_image_url,author_id,author_name,published_at,created_at,updated_at"
        )
        .eq("scope", "organization")
        .eq("organization_id", organizationId)
        .in("status", ["published", "archived"])
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
      "Read organization news posts",
      { table: "news_posts", userId: user?.id, organizationId }
    );
    return (result.data || []).map(mapNewsPostFromSupabase);
  },
  async createOrganizationNewsPost(input) {
    assertConfigured();
    const organizationId = await getCurrentSupabaseOrganizationId();
    const user = await this.getCurrentUser();
    const now = new Date().toISOString();
    const result = await runQuery(
      supabase
        .from("news_posts")
        .insert(
          mapNewsPostPatchToSupabase(
            {
              ...input,
              scope: "organization",
              status: "published",
              authorId: user?.id || "",
              authorName: input.authorName || user?.name || String(user?.email || "").split("@")[0],
              publishedAt: now,
              createdAt: now,
              updatedAt: now,
            },
            organizationId
          )
        )
        .select(
          "id,organization_id,scope,title,summary,content,category,status,cover_image_url,author_id,author_name,published_at,created_at,updated_at"
        )
        .single(),
      "Create organization news post",
      { table: "news_posts", userId: user?.id, organizationId }
    );
    return mapNewsPostFromSupabase(result.data);
  },
  async updateOrganizationNewsPost(id, input) {
    assertConfigured();
    const organizationId = await getCurrentSupabaseOrganizationId();
    const user = await this.getCurrentUser();
    const result = await runQuery(
      supabase
        .from("news_posts")
        .update(
          mapNewsPostPatchToSupabase(
            {
              ...(input.title !== undefined ? { title: input.title } : {}),
              ...(input.summary !== undefined ? { summary: input.summary } : {}),
              ...(input.category !== undefined ? { category: input.category } : {}),
              ...(input.content !== undefined ? { content: input.content } : {}),
              scope: "organization",
              status: input.status || "published",
              updatedAt: new Date().toISOString(),
            },
            organizationId
          )
        )
        .eq("id", id)
        .eq("scope", "organization")
        .eq("organization_id", organizationId)
        .select(
          "id,organization_id,scope,title,summary,content,category,status,cover_image_url,author_id,author_name,published_at,created_at,updated_at"
        )
        .single(),
      "Update organization news post",
      { table: "news_posts", userId: user?.id, organizationId }
    );
    return mapNewsPostFromSupabase(result.data);
  },
  async archiveOrganizationNewsPost(id) {
    return this.updateOrganizationNewsPost(id, { status: "archived" });
  },

  async updateOrganization(organizationId, patch) {
    assertConfigured();
    if (!organizationId) {
      throw new Error("organizationId is required for updateOrganization.");
    }

    const result = await runQuery(
      supabase
        .from("organizations")
        .update(mapOrganizationPatchToSupabase(patch))
        .eq("id", organizationId)
        .select("id,name,type,city,contact_name,contact_phone,description,created_at,updated_at")
        .single(),
      "Update organization"
    );
    return mapOrganizationFromSupabase(result.data);
  },
};



