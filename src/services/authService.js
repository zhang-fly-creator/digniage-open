import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { getRoleLabel, ROLE_LABELS } from "../config/permissions";
import {
  getCurrentMembership as getLocalCurrentMembership,
  getCurrentOrganization as getLocalCurrentOrganization,
  getCurrentUser as getLocalCurrentUser,
} from "./storageService";

export const ROLE_NAMES = ROLE_LABELS;

function assertAuthReady() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
}

function mapOrganization(row = {}) {
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

function mapProfile(row = {}, authUser = null) {
  const metaName = authUser?.user_metadata?.name || "";
  return {
    id: row.id || authUser?.id || "",
    name: row.name || metaName || authUser?.email || "未命名用户",
    email: row.email || authUser?.email || "",
    phone: row.phone || "",
    avatarUrl: row.avatar_url || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

export function mapMembership(row = {}) {
  return {
    id: row.id || "",
    userId: row.user_id || "",
    organizationId: row.organization_id || "",
    email: row.email || "",
    role: row.role || "staff",
    roleName: row.role_name || getRoleLabel(row.role),
    status: row.status || "active",
    invitedBy: row.invited_by || "",
    invitedAt: row.invited_at || "",
    joinedAt: row.joined_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

export function getLocalAuthContext() {
  const membership = getLocalCurrentMembership();
  const organization = getLocalCurrentOrganization();
  const user = getLocalCurrentUser();

  return {
    user,
    profile: user,
    membership,
    organization,
  };
}

export async function ensureSupabaseProfile(user, name = "") {
  assertAuthReady();
  if (!user?.id) return null;

  const profile = {
    id: user.id,
    name: name || user.user_metadata?.name || user.email || "未命名用户",
    email: user.email || "",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select("id,name,email,phone,avatar_url,created_at,updated_at")
    .maybeSingle();

  if (error) {
    throw new Error(`Profile sync failed: ${error.message}`);
  }

  return mapProfile(data, user);
}

async function claimUnboundMemberships(authUser) {
  if (!authUser?.id || !authUser?.email) return;

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("organization_members")
    .update({
      user_id: authUser.id,
      status: "active",
      joined_at: now,
      updated_at: now,
    })
    .is("user_id", null)
    .in("status", ["pending", "active"])
    .ilike("email", authUser.email);

  if (error) {
    throw new Error(`Claim membership failed: ${error.message}`);
  }
}

export async function getSupabaseAuthContext() {
  assertAuthReady();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`Auth session failed: ${sessionError.message}`);
  }

  const authUser = session?.user || null;
  if (!authUser) {
    return {
      user: null,
      profile: null,
      membership: null,
      organization: null,
    };
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id,name,email,phone,avatar_url,created_at,updated_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Read profile failed: ${profileError.message}`);
  }

  const profile = profileRow
    ? mapProfile(profileRow, authUser)
    : await ensureSupabaseProfile(authUser);

  await claimUnboundMemberships(authUser);

  const { data: memberRow, error: memberError } = await supabase
    .from("organization_members")
    .select(
      "id,user_id,organization_id,email,role,role_name,status,invited_by,invited_at,joined_at,created_at,updated_at"
    )
    .eq("user_id", authUser.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memberError) {
    throw new Error(`Read organization membership failed: ${memberError.message}`);
  }

  let fallbackMemberRow = null;
  if (!memberRow) {
    const { data: ownMemberRow, error: ownMemberError } = await supabase
      .from("organization_members")
      .select(
        "id,user_id,organization_id,email,role,role_name,status,invited_by,invited_at,joined_at,created_at,updated_at"
      )
      .eq("user_id", authUser.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ownMemberError) {
      throw new Error(`Read organization membership failed: ${ownMemberError.message}`);
    }
    fallbackMemberRow = ownMemberRow;
  }

  const membership = memberRow ? mapMembership(memberRow) : fallbackMemberRow ? mapMembership(fallbackMemberRow) : null;
  let organization = null;

  if (membership?.organizationId) {
    const { data: organizationRow, error: organizationError } = await supabase
      .from("organizations")
      .select("id,name,type,city,contact_name,contact_phone,description,created_at,updated_at")
      .eq("id", membership.organizationId)
      .maybeSingle();

    if (organizationError) {
      throw new Error(`Read current organization failed: ${organizationError.message}`);
    }

    organization = organizationRow ? mapOrganization(organizationRow) : null;
  }

  return {
    user: profile,
    profile,
    membership,
    organization,
  };
}

export async function signInWithEmail(email, password) {
  assertAuthReady();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || "登录失败，请检查邮箱和密码。");
  }

  return data;
}

export async function signUpWithEmail({ email, password, name }) {
  assertAuthReady();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email,
      },
    },
  });

  if (error) {
    throw new Error(error.message || "注册失败，请稍后重试。");
  }

  if (data.user) {
    await ensureSupabaseProfile(data.user, name || email);
  }

  return data;
}

export async function signOutSupabase() {
  assertAuthReady();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || "退出登录失败。");
  }
}

export function onSupabaseAuthChange(callback) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    callback();
  });
  return () => subscription.unsubscribe();
}
