import { CalendarPlus, ChevronLeft, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import SectionCard from "../components/SectionCard";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useServiceData } from "../hooks/useServiceData";
import { formatAge } from "../utils/age";

const opportunityTypes = [
  "电话问候",
  "入户探访",
  "家属沟通",
  "生日关怀",
  "长期未探访",
  "画像待完善",
  "重点关注",
  "其他",
];

const emptyForm = {
  elderId: "",
  type: "",
  title: "",
  description: "",
  dueDate: "",
  assignedToMemberId: "",
};

function isValidDate(value) {
  if (!value) return true;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

function OpportunityFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOrgRoute = location.pathname.startsWith("/org/");
  const listPath = isOrgRoute ? "/org/opportunities" : "/opportunities";
  const { canCreateServiceOpportunities, user } = useAuthData();
  const {
    assignableMembers,
    elders,
    loading,
    error,
    createOpportunity,
    createOpportunityError,
  } = useServiceData();
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const activeElders = useMemo(
    () => elders.filter((elder) => elder.status !== "archived"),
    [elders]
  );

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFormErrors((previous) => ({ ...previous, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.elderId) nextErrors.elderId = "请选择需要关怀的长者。";
    if (!form.type) nextErrors.type = "请选择服务提醒类型。";
    if (!form.title.trim()) nextErrors.title = "请填写提醒标题。";
    if (!form.description.trim()) nextErrors.description = "请填写说明或建议动作。";
    if (form.dueDate && !isValidDate(form.dueDate)) {
      nextErrors.dueDate = "请填写合法日期。";
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await createOpportunity({
        elderId: form.elderId,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate || "",
        ...(form.assignedToMemberId
          ? (() => {
              const member = assignableMembers.find((item) => item.id === form.assignedToMemberId);
              const now = new Date().toISOString();
              return {
                assignedToUserId: member?.userId || "",
                assignedToMemberId: member?.id || "",
                assignedToName: member?.name || member?.email || "未命名成员",
                assignedRole: member?.role || "",
                assignedAt: now,
                assignedBy: user?.id || "",
              };
            })()
          : {}),
      });
      navigate(listPath, {
        replace: true,
        state: { notice: "服务提醒已创建" },
      });
    } catch {
      // useServiceData exposes a friendly error message for the page.
    } finally {
      setSaving(false);
    }
  };

  if (!canCreateServiceOpportunities) {
    return (
      <SectionCard title="新增服务提醒">
        <div className="space-y-4">
          <p className="rounded-[24px] bg-app-cream px-4 py-4 text-lg font-bold leading-8 text-app-ink">
            你当前没有创建服务提醒权限，请联系机构管理员。
          </p>
          <Link to={listPath} className="secondary-btn">
            返回服务机会
          </Link>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-app-orange text-white">
            <CalendarPlus size={28} strokeWidth={2.3} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold text-app-ink">新增服务提醒</h1>
            <p className="mt-2 text-base leading-7 text-app-muted">
              手动记录一条轻量关怀提醒，后续可关闭或关联服务记录完成。
            </p>
          </div>
        </div>
      </section>

      {error || createOpportunityError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {createOpportunityError || error}
        </section>
      ) : null}

      {loading ? (
        <EmptyState title="正在加载长者列表" note="请稍候。" />
      ) : (
        <form className="space-y-4 rounded-[30px] bg-app-white p-5 shadow-card" onSubmit={handleSubmit}>
          <FormField label="选择长者" error={formErrors.elderId}>
            <select
              value={form.elderId}
              onChange={(event) => updateField("elderId", event.target.value)}
            >
              <option value="">请选择当前在册长者</option>
              {activeElders.map((elder) => (
                <option key={elder.id} value={elder.id}>
                  {elder.name} · {formatAge(elder.birthDate)} · {elder.gender || "未填写"}
                </option>
              ))}
            </select>
          </FormField>

          {!activeElders.length ? (
            <p className="rounded-[22px] bg-app-cream px-4 py-3 text-base font-bold leading-7 text-app-muted">
              当前没有可选择的在册长者。已归档长者不会出现在这里。
            </p>
          ) : null}

          <FormField label="机会类型" error={formErrors.type}>
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
            >
              <option value="">请选择服务提醒类型</option>
              {opportunityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="提醒标题" error={formErrors.title}>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="例如：本周电话问候王秀兰"
            />
          </FormField>

          <FormField label="说明 / 建议动作" error={formErrors.description}>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="例如：建议本周电话联系一次，了解近期身体和情绪状态。"
              rows={5}
            />
          </FormField>

          <FormField label="截止时间" hint="选填" error={formErrors.dueDate}>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => updateField("dueDate", event.target.value)}
            />
          </FormField>

          <FormField label="负责人" hint="选填">
            <select
              value={form.assignedToMemberId}
              onChange={(event) => updateField("assignedToMemberId", event.target.value)}
            >
              <option value="">暂不指定</option>
              {assignableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email || "未命名成员"} · {member.roleName}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={saving || !activeElders.length}
              className="primary-btn min-h-12 disabled:bg-app-line disabled:text-app-muted"
            >
              <Save size={20} />
              保存服务提醒
            </button>
            <Link to={listPath} className="secondary-btn min-h-12">
              <ChevronLeft size={20} />
              返回列表
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default OpportunityFormPage;
