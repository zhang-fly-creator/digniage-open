import { useEffect, useState } from "react";
import FormField from "../components/FormField";
import SectionCard from "../components/SectionCard";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useOrganizationData } from "../hooks/useOrganizationData";

const emptyForm = {
  name: "",
  type: "",
  city: "",
  contactName: "",
  contactPhone: "",
  description: "",
};

function OrganizationSettingsPage() {
  const { canEditOrganizationSettings: canEdit } = useAuthData();
  const {
    organization,
    loading,
    refreshing,
    initialLoading,
    error,
    saveError,
    saving,
    usingSupabase,
    saveOrganization,
  } = useOrganizationData();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setForm({ ...emptyForm, ...(organization || {}) });
  }, [organization]);

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canEdit) return;
    const nextErrors = {};
    const phone = form.contactPhone.trim();

    if (!form.name.trim()) nextErrors.name = "机构名称不能为空。";
    if (!form.contactName.trim()) nextErrors.contactName = "联系人不能为空。";
    if (phone && !/^[\d\s+\-()]{6,20}$/.test(phone)) {
      nextErrors.contactPhone = "联系电话格式看起来不正确。";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      window.alert("请先修正机构设置表单。");
      return;
    }

    try {
      await saveOrganization(form);
      setNotice("机构设置已保存。");
    } catch {
      setNotice("");
    }
  };

  if (!canEdit) {
    return (
      <SectionCard title="机构设置" note="维护当前机构的基础信息。">
        <p className="rounded-[24px] bg-app-cream px-4 py-4 text-lg font-bold leading-8 text-app-ink">
          你当前没有机构设置权限，请联系机构管理员。
        </p>
      </SectionCard>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <SectionCard
        title="机构设置"
        note={usingSupabase ? "维护 Supabase organizations 表中的当前机构信息。" : "维护当前机构的基础信息。"}
      >
        <div className="space-y-5">
          {initialLoading ? (
            <p className="rounded-[20px] bg-app-cream px-4 py-3 text-base font-bold leading-7 text-app-ink">
              正在读取机构信息...
            </p>
          ) : null}
          {refreshing ? (
            <p className="rounded-[20px] bg-app-blue px-4 py-3 text-sm font-bold leading-6 text-app-ink">
              正在同步机构信息...
            </p>
          ) : null}
          {error ? (
            <p className="rounded-[20px] bg-app-orangeSoft px-4 py-3 text-base font-bold leading-7 text-app-orange">
              {error}
            </p>
          ) : null}
          <FormField label="机构名称" error={errors.name}>
            <input
              className="text-lg"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </FormField>
          <FormField label="机构类型">
            <input
              className="text-lg"
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
            />
          </FormField>
          <FormField label="所在城市">
            <input
              className="text-lg"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="例如：上海"
            />
          </FormField>
          <FormField label="联系人" error={errors.contactName}>
            <input
              className="text-lg"
              value={form.contactName}
              onChange={(event) => updateField("contactName", event.target.value)}
            />
          </FormField>
          <FormField label="联系电话" error={errors.contactPhone}>
            <input
              className="text-lg"
              value={form.contactPhone}
              onChange={(event) => updateField("contactPhone", event.target.value)}
              placeholder="未填写"
            />
          </FormField>
          <FormField label="机构说明">
            <textarea
              className="min-h-28 text-lg leading-8"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </FormField>
        </div>
      </SectionCard>

      {notice ? (
        <section className="rounded-[24px] bg-app-green p-4 text-base font-bold leading-7 text-app-ink">
          {notice}
        </section>
      ) : null}

      {saveError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {saveError}
        </section>
      ) : null}

      <button
        type="submit"
        disabled={saving || initialLoading}
        className="w-full rounded-[24px] bg-app-orange px-5 py-4 text-lg font-extrabold text-white shadow-card active:scale-[0.99] disabled:bg-app-line disabled:text-app-muted"
      >
        {saving ? "正在保存..." : "保存机构设置"}
      </button>
    </form>
  );
}

export default OrganizationSettingsPage;
