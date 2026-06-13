import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { ROLE_NAMES, mapMembership } from "./authService";
import {
  getCurrentOrganization as getLocalCurrentOrganization,
  getOrganizationMembers as getLocalOrganizationMembers,
} from "./storageService";
import { isUsingSupabaseProvider } from "./dataProvider";

const MEMBER_BASE_SELECT =
  "id,user_id,organization_id,email,name,role,role_name,status,invited_by,invited_at,joined_at,created_at,updated_at";

const MEMBER_SELECT_WITH_PROFILE = `${MEMBER_BASE_SELECT},user_profile:profiles!organization_members_user_id_fkey(id,name,email)`;

function assertConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function mapMember(row = {}) {
  const base = mapMembership(row);
  const profile = row.user_profile || row.profiles || null;
  return {
    ...base,
    id: base.id || row.id || "",
    userId: base.userId || row.userId || "",
    organizationId: base.organizationId || row.organizationId || "",
    name: profile?.name || row.name || "",
    email: base.email || profile?.email || row.email || "",
    role: base.role || row.role || "staff",
    roleName: base.roleName || row.roleName || ROLE_NAMES[row.role] || "服务人员",
    status: base.status || row.status || "active",
  };
}

function sortAssignableMembers(members = []) {
  const roleOrder = { staff: 0, volunteer: 1, org_admin: 2 };
  return [...members].sort((a, b) => {
    const roleDiff = (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9);
    if (roleDiff) return roleDiff;
    return String(a.name || a.email || "").localeCompare(String(b.name || b.email || ""), "zh-Hans-CN");
  });
}

function assertRole(role) {
  if (!["org_admin", "staff", "volunteer"].includes(role)) {
    throw new Error("Invalid member role.");
  }
}

export async function getOrganizationMembers(organizationId) {
  assertConfigured();
  if (!organizationId) return [];

  let query = supabase
    .from("organization_members")
    .select(MEMBER_SELECT_WITH_PROFILE)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  let { data, error } = await query;

  if (error) {
    console.warn(
      "[memberService] Read members with profiles join failed, falling back to membership rows only.",
      error
    );

    query = supabase
      .from("organization_members")
      .select(MEMBER_BASE_SELECT)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true });

    ({ data, error } = await query);
  }

  if (error) {
    throw new Error(`Read organization members failed: ${error.message}`);
  }

  return (data || []).map(mapMember);
}

export async function getActiveMembersForCurrentOrganization(organizationId) {
  if (!isUsingSupabaseProvider()) {
    const organization = getLocalCurrentOrganization();
    const targetOrganizationId = organizationId || organization?.id;
    return getLocalOrganizationMembers()
      .filter(
        (member) =>
          member.organizationId === targetOrganizationId &&
          member.status === "active"
      )
      .map(mapMember);
  }

  const members = await getOrganizationMembers(organizationId);
  return members.filter((member) => member.status === "active");
}

export async function getAssignableMembers(organizationId) {
  const members = await getActiveMembersForCurrentOrganization(organizationId);
  return sortAssignableMembers(
    members.filter((member) =>
      ["org_admin", "staff", "volunteer"].includes(member.role)
    )
  );
}

export async function getMemberByUserId({ organizationId, userId }) {
  if (!userId) return null;
  const members = await getActiveMembersForCurrentOrganization(organizationId);
  return members.find((member) => member.userId === userId) || null;
}

export async function addOrganizationMember({
  organizationId,
  name,
  email,
  role,
  invitedBy,
}) {
  assertConfigured();
  assertRole(role);

  const normalizedEmail = normalizeEmail(email);
  if (!organizationId || !normalizedEmail) {
    throw new Error("organizationId and email are required.");
  }

  const existing = await getOrganizationMembers(organizationId);
  const duplicated = existing.some(
    (member) =>
      normalizeEmail(member.email) === normalizedEmail &&
      member.status !== "removed"
  );

  if (duplicated) {
    const error = new Error("该邮箱已在当前机构成员列表中。");
    error.code = "DUPLICATED_MEMBER_EMAIL";
    throw error;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: null,
      email: normalizedEmail,
      name: String(name || "").trim() || null,
      role,
      role_name: ROLE_NAMES[role],
      status: "pending",
      invited_by: invitedBy || null,
      invited_at: now,
      updated_at: now,
    })
    .select(MEMBER_BASE_SELECT)
    .single();

  if (error) {
    throw new Error(`Add organization member failed: ${error.message}`);
  }

  return mapMember(data);
}

export function ensureCanChangeLastAdmin({ members, targetMemberId, nextRole, nextStatus }) {
  const activeAdmins = members.filter(
    (member) => member.status === "active" && member.role === "org_admin"
  );
  const target = members.find((member) => member.id === targetMemberId);
  const willStopBeingActiveAdmin =
    target?.status === "active" &&
    target?.role === "org_admin" &&
    (nextRole !== "org_admin" || nextStatus === "removed");

  if (willStopBeingActiveAdmin && activeAdmins.length <= 1) {
    throw new Error("当前机构至少需要保留一名机构管理员。");
  }
}

export async function updateOrganizationMemberRole({ memberId, role }) {
  assertConfigured();
  assertRole(role);
  if (!memberId) throw new Error("memberId is required.");

  const { data, error } = await supabase
    .from("organization_members")
    .update({
      role,
      role_name: ROLE_NAMES[role],
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .select(MEMBER_BASE_SELECT)
    .single();

  if (error) {
    throw new Error(`Update member role failed: ${error.message}`);
  }

  return mapMember(data);
}

export async function removeOrganizationMember(memberId) {
  assertConfigured();
  if (!memberId) throw new Error("memberId is required.");

  const { data, error } = await supabase
    .from("organization_members")
    .update({
      status: "removed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .select(MEMBER_BASE_SELECT)
    .single();

  if (error) {
    throw new Error(`Remove member failed: ${error.message}`);
  }

  return mapMember(data);
}
