import { useCallback, useEffect, useState } from "react";
import { isUsingSupabaseProvider } from "../services/dataProvider";
import {
  addOrganizationMember,
  ensureCanChangeLastAdmin,
  getOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "../services/memberService";
import { useAuthData } from "./useAuthData.jsx";

export function useMemberData() {
  const {
    canManageMembers,
    membership,
    organization,
    user,
    usingSupabaseAuth,
  } = useAuthData();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(() => isUsingSupabaseProvider());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setError("");

    if (!isUsingSupabaseProvider()) {
      setMembers([]);
      setLoading(false);
      return [];
    }

    if (!organization?.id || !membership?.id) {
      setMembers([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    try {
      const nextMembers = await getOrganizationMembers(organization.id);
      setMembers(nextMembers);
      return nextMembers;
    } catch (nextError) {
      console.error(nextError);
      setError("成员身份读取失败，请检查 Supabase 配置或稍后重试。");
      setMembers([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [membership?.id, organization?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addMember = useCallback(
    async ({ name, email, role }) => {
      if (!usingSupabaseAuth || !canManageMembers) {
        throw new Error("你当前没有成员管理权限，请联系机构管理员。");
      }
      setSaving(true);
      try {
        await addOrganizationMember({
          organizationId: organization.id,
          name,
          email,
          role,
          invitedBy: user?.id,
        });
        return await reload();
      } finally {
        setSaving(false);
      }
    },
    [canManageMembers, organization?.id, reload, user?.id, usingSupabaseAuth]
  );

  const updateRole = useCallback(
    async (memberId, role) => {
      if (!usingSupabaseAuth || !canManageMembers) {
        throw new Error("你当前没有成员管理权限，请联系机构管理员。");
      }
      ensureCanChangeLastAdmin({
        members,
        targetMemberId: memberId,
        nextRole: role,
        nextStatus: members.find((member) => member.id === memberId)?.status,
      });
      setSaving(true);
      try {
        await updateOrganizationMemberRole({ memberId, role });
        return await reload();
      } finally {
        setSaving(false);
      }
    },
    [canManageMembers, members, reload, usingSupabaseAuth]
  );

  const removeMember = useCallback(
    async (memberId) => {
      if (!usingSupabaseAuth || !canManageMembers) {
        throw new Error("你当前没有成员管理权限，请联系机构管理员。");
      }
      const target = members.find((member) => member.id === memberId);
      ensureCanChangeLastAdmin({
        members,
        targetMemberId: memberId,
        nextRole: target?.role,
        nextStatus: "removed",
      });
      setSaving(true);
      try {
        await removeOrganizationMember(memberId);
        return await reload();
      } finally {
        setSaving(false);
      }
    },
    [canManageMembers, members, reload, usingSupabaseAuth]
  );

  return {
    members,
    loading,
    error,
    saving,
    reload,
    addMember,
    updateRole,
    removeMember,
  };
}
