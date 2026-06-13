import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FormField from "../../components/FormField";
import PermissionDenied from "../../components/PermissionDenied";
import SectionCard from "../../components/SectionCard";
import { useAuthData } from "../../hooks/useAuthData.jsx";
import { useNewsData } from "../../hooks/useNewsData";

const categories = ["动态", "通知", "活动", "案例", "系统"];

const emptyForm = {
  title: "",
  summary: "",
  category: "动态",
  content: "",
};

function OrgNewsFormPage() {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(newsId);
  const { canPublishNews, usingSupabaseAuth, isAuthenticated } = useAuthData();
  const { posts, loading, error, saveError, createPost, updatePost } = useNewsData({
    organizationOnly: true,
  });
  const currentPost = useMemo(() => posts.find((item) => item.id === newsId) || null, [newsId, posts]);
  const [form, setForm] = useState(() => {
    if (!isEdit) return emptyForm;
    return emptyForm;
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentPost) {
      setForm({
        title: currentPost.title || "",
        summary: currentPost.summary || "",
        category: currentPost.category || "动态",
        content: currentPost.content || "",
      });
    }
  }, [currentPost]);

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "请填写标题。";
    if (!form.content.trim()) nextErrors.content = "请填写正文。";
    if (form.summary.trim().length > 100) nextErrors.summary = "摘要建议控制在 100 字以内。";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updatePost(newsId, {
          title: form.title.trim(),
          summary: form.summary.trim(),
          category: form.category,
          content: form.content.trim(),
        });
        navigate("/org/news", { replace: true, state: { notice: "机构动态已更新" } });
      } else {
        await createPost({
          title: form.title.trim(),
          summary: form.summary.trim(),
          category: form.category,
          content: form.content.trim(),
        });
        navigate("/org/news", { replace: true, state: { notice: "机构动态已发布" } });
      }
    } catch {
      // message from hook
    } finally {
      setSaving(false);
    }
  };

  if (usingSupabaseAuth && !isAuthenticated) {
    return (
      <SectionCard title={isEdit ? "编辑机构动态" : "发布机构动态"}>
        <p className="rounded-[24px] bg-app-orangeSoft px-4 py-4 text-base font-bold leading-7 text-app-orange">
          请先登录后继续。
        </p>
        <Link to="/auth" className="primary-btn mt-4 w-full">
          登录 / 注册
        </Link>
      </SectionCard>
    );
  }

  if (!canPublishNews) {
    return <PermissionDenied />;
  }

  if (isEdit && loading) {
    return (
      <SectionCard title="编辑机构动态">
        <p className="rounded-[24px] bg-app-cream px-4 py-4 text-base font-bold leading-7 text-app-ink">
          正在加载动态内容...
        </p>
      </SectionCard>
    );
  }

  if (isEdit && !currentPost && !loading) {
    return (
      <SectionCard title="编辑机构动态">
        <p className="rounded-[24px] bg-app-cream px-4 py-4 text-base font-bold leading-7 text-app-ink">
          未找到这条机构动态。
        </p>
      </SectionCard>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <SectionCard title={isEdit ? "编辑机构动态" : "发布机构动态"}>
        <p className="text-base leading-7 text-app-muted">
          使用简洁文字发布通知、活动和服务报道。
        </p>
      </SectionCard>

      {error || saveError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {saveError || error}
        </section>
      ) : null}

      <section className="rounded-[24px] bg-app-cream px-4 py-4">
        <p className="text-base font-extrabold text-app-ink">公开内容提醒</p>
        <p className="mt-2 text-sm font-bold leading-6 text-app-muted">
          机构动态为公开内容，请勿发布长者真实姓名、联系方式、详细住址、身份证号、详细病历、家庭纠纷、财产情况等敏感信息。涉及服务案例时，请使用“张奶奶”“某社区老人”等脱敏称呼。
        </p>
      </section>

      <SectionCard title="动态内容">
        <div className="space-y-4">
          <FormField label="标题" error={errors.title}>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="请输入标题"
            />
          </FormField>

          <FormField label="摘要" hint="选填，建议 100 字以内" error={errors.summary}>
            <textarea
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              rows={3}
              placeholder="请输入摘要"
            />
          </FormField>

          <FormField label="分类">
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="正文" error={errors.content}>
            <textarea
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              rows={10}
              placeholder="请输入正文内容"
            />
          </FormField>
        </div>
      </SectionCard>

      <section className="rounded-[24px] bg-app-cream px-4 py-4 text-sm font-bold leading-6 text-app-muted">
        请勿发布老人身份证号、详细住址、完整电话、详细病历、家庭纠纷、财产情况等敏感信息。涉及老人照片、姓名和个人故事时，请确认已获得本人或家属授权。
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={saving}
          className="primary-btn min-h-12 disabled:bg-app-line disabled:text-app-muted"
        >
          <Save size={18} />
          {saving ? "正在保存..." : isEdit ? "保存更新" : "发布机构动态"}
        </button>
        <Link to="/org/news" className="secondary-btn min-h-12">
          返回机构动态
        </Link>
      </div>
    </form>
  );
}

export default OrgNewsFormPage;
