import { ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import PermissionDenied from "../components/PermissionDenied";
import SectionCard from "../components/SectionCard";
import { getRoleLabel } from "../config/permissions";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useMemberData } from "../hooks/useMemberData";
import { isUsingSupabaseProvider } from "../services/dataProvider";
import { formatDateTime } from "../utils/date";

const roleOptions = [
  { value: "org_admin", label: "机构管理员" },
  { value: "staff", label: "工作人员" },
  { value: "volunteer", label: "志愿者" },
];

const statusLabel = {
  active: "已加入",
  pending: "待认领",
  removed: "已移除",
};

const statusClass = {
  active: "bg-app-green text-app-ink",
  pending: "bg-app-orangeSoft text-app-orange",
  removed: "bg-app-cream text-app-muted",
};

const emptyForm = {
  name: "",
  email: "",
  role: "staff",
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function MemberCard({ member, onRoleChange, onRemove, saving }) {
  const status = member.status || "pending";
  const displayName = member.name || member.email || "未命名成员";
  const timeText =
    status === "active"
      ? member.joinedAt || member.createdAt
      : status === "pending"
        ? member.invitedAt || member.createdAt
        : member.updatedAt;

  return (
    <article className="rounded-[28px] bg-app-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center">
        <div className="min-w-0">
          <h3 className="break-words text-xl font-extrabold text-app-ink">{displayName}</h3>
          <p className="mt-1 break-words text-sm font-bold text-app-muted">
            {member.email || "邮箱未填写"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-app-blue px-3 py-1.5 text-sm font-extrabold text-app-ink">
            {member.roleName || getRoleLabel(member.role)}
          </span>
          <span className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${statusClass[status] || statusClass.pending}`}>
            {statusLabel[status] || "待认领"}
          </span>
        </div>

        <p className="text-sm font-bold leading-6 text-app-muted">
          {timeText ? formatDateTime(timeText) : "暂无时间"}
        </p>

        {status !== "removed" ? (
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <select
              className="min-h-11 rounded-[18px] text-sm font-bold"
              value={member.role}
              disabled={saving}
              onChange={(event) => onRoleChange(member, event.target.value)}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={saving}
              onClick={() => onRemove(member)}
              className="secondary-btn min-h-11 bg-app-cream disabled:text-app-muted"
            >
              移除成员
            </button>
          </div>
        ) : (
          <span className="text-sm font-bold text-app-muted lg:text-right">已移除</span>
        )}
      </div>
    </article>
  );
}

function MembersPage() {
  const {
    canManageMembers,
    hasActiveMembership,
    organization,
    usingSupabaseAuth,
  } = useAuthData();
  const { members, loading, error, saving, addMember, updateRole, removeMember } = useMemberData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const activeOrPendingEmails = useMemo(
    () =>
      new Set(
        members
          .filter((member) => member.status !== "removed")
          .map((member) => String(member.email || "").trim().toLowerCase())
          .filter(Boolean)
      ),
    [members]
  );

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFormErrors((previous) => ({ ...previous, [key]: "" }));
    setNotice("");
    setActionError("");
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const email = form.email.trim().toLowerCase();

    if (!email) nextErrors.email = "邮箱不能为空。";
    if (email && !isValidEmail(email)) nextErrors.email = "邮箱格式必须合法。";
    if (!form.role) nextErrors.role = "角色不能为空。";
    if (email && activeOrPendingEmails.has(email)) {
      nextErrors.email = "该邮箱已在当前机构成员列表中。";
    }

    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }

    try {
      await addMember({ name: form.name.trim(), email, role: form.role });
      setForm(emptyForm);
      setShowForm(false);
      setNotice("成员已添加，当前状态为待加入。");
      setActionError("");
    } catch (nextError) {
      setActionError(nextError.message || "添加失败，请稍后重试。");
    }
  };

  const handleRoleChange = async (member, role) => {
    if (member.role === role) return;
    try {
      await updateRole(member.id, role);
      setNotice("成员角色已更新。");
      setActionError("");
    } catch (nextError) {
      setActionError(nextError.message || "添加失败，请稍后重试。");
    }
  };

  const handleRemove = async (member) => {
    const ok = window.confirm(
      "移除后，该成员将无法继续访问当前机构数据。历史服务记录不会删除。"
    );
    if (!ok) return;

    try {
      await removeMember(member.id);
      setNotice("成员已移除。");
      setActionError("");
    } catch (nextError) {
      setActionError(nextError.message || "添加失败，请稍后重试。");
    }
  };

  if (!isUsingSupabaseProvider() || !usingSupabaseAuth) {
    return (
      <SectionCard title="成员管理" note="管理当前机构的服务人员与志愿者身份。">
        <p className="rounded-[24px] bg-app-cream px-4 py-4 text-lg font-bold leading-8 text-app-ink">
          成员管理仅 Supabase 模式可用。当前 localStorage fallback 继续使用 mock 身份。
        </p>
      </SectionCard>
    );
  }

  if (!hasActiveMembership || !canManageMembers) {
    return <PermissionDenied />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
                <UsersRound size={24} />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold text-app-ink">成员管理</h1>
                <p className="mt-1 text-base font-bold text-app-muted">
                  管理当前机构的服务人员与志愿者身份。
                </p>
              </div>
            </div>
            <p className="mt-4 rounded-[22px] bg-app-cream px-4 py-3 text-base font-bold leading-7 text-app-ink">
              当前机构：{organization?.name || "机构空间"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm((previous) => !previous);
              setActionError("");
              setNotice("");
            }}
            className="primary-btn"
          >
            <UserPlus size={20} />
            添加成员
          </button>
        </div>
      </section>

      {showForm ? (
        <form className="space-y-4 rounded-[30px] bg-app-white p-5 shadow-card" onSubmit={handleAddMember}>
          <h2 className="text-2xl font-extrabold text-app-ink">添加成员</h2>
          <FormField label="姓名">
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="例如：测试志愿者"
            />
          </FormField>
          <FormField label="邮箱" error={formErrors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="member@example.com"
            />
          </FormField>
          <FormField label="角色" error={formErrors.role}>
            <select value={form.role} onChange={(event) => updateField("role", event.target.value)}>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="submit" disabled={saving} className="primary-btn disabled:bg-app-line disabled:text-app-muted">
              保存成员
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="secondary-btn">
              取消
            </button>
          </div>
        </form>
      ) : null}

      {notice ? (
        <section className="rounded-[24px] bg-app-green p-4 text-base font-bold leading-7 text-app-ink">
          {notice}
        </section>
      ) : null}

      {error || actionError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {actionError || error}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck size={20} className="text-app-orange" />
          <h2 className="text-xl font-extrabold text-app-ink">成员列表</h2>
          <span className="text-sm font-bold text-app-muted">{members.length} 人</span>
        </div>

        {loading ? (
          <EmptyState title="正在读取成员" note="请稍候。" />
        ) : members.length ? (
          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                saving={saving}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="暂无机构成员" note="点击“添加成员”，预登记工作人员或志愿者。" />
        )}
      </section>
    </div>
  );
}

export default MembersPage;
