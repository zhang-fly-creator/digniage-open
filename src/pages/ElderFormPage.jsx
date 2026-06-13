import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormField from "../components/FormField";
import PermissionDenied from "../components/PermissionDenied";
import SectionCard from "../components/SectionCard";
import { useElderData } from "../hooks/useElderData";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { generateElderCard } from "../services/aiService";
import {
  clearElderFormDraft,
  getElderFormDraft,
  resolveElderBirthdayMonthDay,
  setElderFormDraft,
} from "../services/storageService";
import { calculateAge, formatAge } from "../utils/age";
import {
  extractBirthDateFromIdCard,
  getIdCardLast4,
  isValidIdCardNumber,
  normalizeIdCardNumber,
} from "../utils/privacy";
import { getChineseElderAvatar } from "../utils/avatars";
import { normalizeNextSuggestion } from "../utils/nextSuggestion";

const DEFAULT_BIRTH_DATE = "1977-02-04";
const AI_TRIM_NOTICE = "部分长文本较长，AI整理时已自动截取前半部分内容。";
const AI_FAILURE_NOTICE = "AI生成失败，请稍后重试；你也可以先手动填写知老卡内容。";

const emptyForm = {
  name: "",
  birthDate: DEFAULT_BIRTH_DATE,
  phone: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
  address: "",
  storeName: "",
  idCardNumber: "",
  healthCondition: "",
  careNotesPublic: "",
  privateNotes: "",
  contactNote: "",
  otherContactInfo: "",
  gender: "女",
  avatar: "",
  nickname: "",
  formerJob: "",
  lifeExperience: "",
  interests: "",
  favoriteTopics: "",
  avoidTopics: "",
  communicationStyle: "",
  familyNote: "",
  careNoteInput: "",
  staffNote: "",
  summary: "",
  tags: [],
  aiFavoriteTopics: "",
  communicationAdvice: "",
  careNote: "",
  nextSuggestion: "",
  serviceOpportunities: [],
};

function TextInput(props) {
  return <input className="text-lg" {...props} />;
}

function TextArea(props) {
  return <textarea className="min-h-28 text-lg leading-8" {...props} />;
}

function isValidDate(value) {
  if (!value) return true;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

function normalizeDateInput(value) {
  const normalized = String(value || "").trim().replace(/\//g, "-");
  if (!normalized) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  return normalized;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function compressImageDataUrl(dataUrl, type = "image/jpeg") {
  const image = await loadImage(dataUrl);
  const maxSize = 512;
  const ratio = Math.min(maxSize / image.width, maxSize / image.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(type, 0.78);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function buildFormFromElder(elder = {}) {
  return {
    ...emptyForm,
    ...elder,
    birthDate: normalizeDateInput(elder.birthDate || DEFAULT_BIRTH_DATE),
    favoriteTopics: Array.isArray(elder.favoriteTopics)
      ? elder.favoriteTopics.join("，")
      : elder.favoriteTopics || "",
    avoidTopics: Array.isArray(elder.avoidTopics)
      ? elder.avoidTopics.join("，")
      : elder.avoidTopics || "",
    careNoteInput: elder.careNoteInput ?? "",
    staffNote: elder.staffNote ?? "",
    aiFavoriteTopics: elder.aiFavoriteTopics || "",
    communicationAdvice:
      elder.communicationAdvice || elder.communicationStyle || "",
  };
}

function getDraftTimestamp(value) {
  const time = new Date(value || "").getTime();
  return Number.isNaN(time) ? 0 : time;
}

function parseTagInput(value) {
  return String(value || "")
    .split(/[,，、\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function trimForAi(value, maxLength) {
  const text = String(value || "");
  if (text.length <= maxLength) {
    return { value: text, trimmed: false };
  }

  return {
    value: text.slice(0, maxLength),
    trimmed: true,
  };
}

function buildAiInput(form) {
  const lifeExperience = trimForAi(form.lifeExperience, 1000);
  const interests = trimForAi(form.interests, 500);
  const favoriteTopics = trimForAi(form.favoriteTopics, 500);
  const avoidTopics = trimForAi(form.avoidTopics, 500);
  const familyNote = trimForAi(form.familyNote, 800);
  const careNoteInput = trimForAi(form.careNoteInput, 800);
  const staffNote = trimForAi(form.staffNote, 800);

  return {
    data: {
      ...form,
      lifeExperience: lifeExperience.value,
      interests: interests.value,
      favoriteTopics: favoriteTopics.value,
      avoidTopics: avoidTopics.value,
      familyNote: familyNote.value,
      careNoteInput: careNoteInput.value,
      staffNote: staffNote.value,
    },
    wasTrimmed: [
      lifeExperience,
      interests,
      favoriteTopics,
      avoidTopics,
      familyNote,
      careNoteInput,
      staffNote,
    ].some((item) => item.trimmed),
  };
}

function ElderFormPage() {
  const { elderId } = useParams();
  const navigate = useNavigate();
  const {
    elders,
    saveElder,
    usingSupabase,
    refreshing,
    initialLoading,
    saving,
    error,
    saveError,
  } = useElderData();
  const { user, canEditElders, canEditElderSensitiveInfo } = useAuthData();
  const currentElder = useMemo(
    () => elders.find((item) => item.id === elderId),
    [elders, elderId]
  );

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [aiGenerated, setAiGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState("");
  const [draftNotice, setDraftNotice] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const initializedKeyRef = useRef("");
  const lastRemoteUpdatedAtRef = useRef("");
  const draftKeyId = elderId || "";
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const formKey = elderId || "new";
    const remoteUpdatedAt = currentElder?.updatedAt || "";
    const draft = getElderFormDraft(draftKeyId);
    const shouldUseDraft =
      draft?.formData &&
      getDraftTimestamp(draft.updatedAt) >
        getDraftTimestamp(currentElder?.updatedAt || "");

    const shouldInitialize =
      initializedKeyRef.current !== formKey ||
      (!isDirty &&
        remoteUpdatedAt &&
        remoteUpdatedAt !== lastRemoteUpdatedAtRef.current);

    if (!shouldInitialize) return;
    if (elderId && !currentElder) return;

    const baseForm = currentElder ? buildFormFromElder(currentElder) : { ...emptyForm };
    const nextForm = shouldUseDraft ? { ...baseForm, ...draft.formData } : baseForm;

    setForm(nextForm);
    setErrors({});
    setAiGenerated(
      Boolean(
        nextForm.summary ||
          nextForm.aiFavoriteTopics ||
          nextForm.communicationAdvice ||
          nextForm.careNote ||
          nextForm.nextSuggestion ||
          nextForm.tags?.length
      )
    );
    setDraftNotice(shouldUseDraft ? "已恢复上次未保存的编辑内容。" : "");
    setIsDirty(false);
    initializedKeyRef.current = formKey;
    lastRemoteUpdatedAtRef.current = remoteUpdatedAt;
  }, [currentElder, draftKeyId, elderId, isDirty]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const timeout = window.setTimeout(() => {
      setElderFormDraft(draftKeyId, {
        formData: form,
        updatedAt: new Date().toISOString(),
        elderUpdatedAt: currentElder?.updatedAt || "",
      });
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [currentElder?.updatedAt, draftKeyId, form, isDirty]);

  const hasAiResult = Boolean(
    form.summary ||
      form.aiFavoriteTopics ||
      form.communicationAdvice ||
      form.careNote ||
      form.nextSuggestion ||
      form.tags?.length ||
      aiGenerated
  );
  const nextSuggestion = normalizeNextSuggestion(form.nextSuggestion);
  const idCardBirthDate = extractBirthDateFromIdCard(form.idCardNumber);
  const hasIdCardBirthDateMismatch =
    canEditElderSensitiveInfo &&
    Boolean(idCardBirthDate && form.birthDate && idCardBirthDate !== form.birthDate);

  const updateField = (key, value) => {
    const nextValue =
      key === "idCardNumber"
        ? normalizeIdCardNumber(value)
        : key === "birthDate"
          ? normalizeDateInput(value)
          : value;
    setForm((previous) => ({ ...previous, [key]: nextValue }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setIsDirty(true);
    setDraftNotice("");
  };

  const updateNextSuggestion = (key, value) => {
    setForm((previous) => ({
      ...previous,
      nextSuggestion: {
        ...normalizeNextSuggestion(previous.nextSuggestion),
        [key]: value,
      },
    }));
    setIsDirty(true);
    setDraftNotice("");
  };

  const handleAvatarUpload = async (event) => {
    const generated = null;
    const meta = { fallbackUsed: false };
    const wasTrimmed = false;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("请选择图片文件。");
      
    }

    if (file.size > 8 * 1024 * 1024) {
      window.alert("图片过大，请选择更小的照片。");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      window.alert("图片较大，系统将自动压缩后保存。");
    }

    try {
      const originalDataUrl = await readFileAsDataUrl(file);
      const targetType = file.type === "image/webp" ? "image/webp" : "image/jpeg";
      const compressedDataUrl = await compressImageDataUrl(originalDataUrl, targetType);
      updateField("avatar", compressedDataUrl);
      return;
      const sourceNotice =
        generated?._aiWarning ||
        (generated?._aiSource === "real_ai"
          ? "已使用真实 AI 生成知老卡，建议人工确认后保存。"
          : generated?._aiSource === "mock_fallback" || meta?.fallbackUsed
            ? "真实 AI 暂不可用，已使用本地模拟建议。"
            : "");
      setAiNotice(
        wasTrimmed && sourceNotice
          ? `${AI_TRIM_NOTICE} ${sourceNotice}`
          : wasTrimmed
            ? AI_TRIM_NOTICE
            : sourceNotice
      );
    } catch {
      
      window.alert("图片压缩失败，将使用原图保存，可能占用较多本地空间。");
      const originalDataUrl = await readFileAsDataUrl(file);
      updateField("avatar", originalDataUrl);
    }
  };

  const clearAvatar = () => {
    updateField("avatar", "");
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    const { data: aiInput, wasTrimmed } = buildAiInput(form);
    setIsGenerating(true);
    setAiNotice("");
    try {
      const { data: generated, meta } = await generateElderCard({
        ...aiInput,
        idCardNumber: "",
        idCardLast4: "",
        idCardUpdatedAt: "",
        idCardUpdatedBy: "",
      });
      setForm((previous) => ({
        ...previous,
        ...generated,
      }));
      setAiGenerated(true);
      setIsDirty(true);
      const nextAiNotice =
        generated?._aiWarning ||
        (generated?._aiSource === "real_ai"
          ? "已使用真实 AI 生成知老卡，建议人工确认后保存。"
          : generated?._aiSource === "mock_fallback" || meta?.fallbackUsed
            ? "真实 AI 暂不可用，已使用本地模拟建议。"
            : "");
      queueMicrotask(() => {
        setAiNotice(
          wasTrimmed && nextAiNotice
            ? `${AI_TRIM_NOTICE} ${nextAiNotice}`
            : wasTrimmed
              ? AI_TRIM_NOTICE
              : nextAiNotice
        );
      });
      if (generated?._aiSource === "real_ai") {
        setAiNotice("已使用真实 AI 生成知老卡，建议人工确认后保存。");
      }
      if (meta?.fallbackUsed) {
        setAiNotice("真实 AI 暂不可用，已使用本地模拟建议。");
      }
    } catch {
      setAiNotice(AI_FAILURE_NOTICE);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "姓名不能为空。";
    }

    if (form.birthDate && !isValidDate(form.birthDate)) {
      nextErrors.birthDate = "出生日期格式不正确。";
    }

    if (canEditElderSensitiveInfo && form.idCardNumber && !isValidIdCardNumber(form.idCardNumber)) {
      nextErrors.idCardNumber = "请输入正确的18位身份证号码。";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      window.alert("请先修正表单中的提示。");
      return;
    }

    const elderIdForSave = currentElder?.id || (usingSupabase ? "" : `elder-${Date.now()}`);
    const compatibilityBirthday =
      resolveElderBirthdayMonthDay({
        birthDate: form.birthDate,
        birthday: currentElder?.birthday || "",
        careDate: currentElder?.careDate || "",
      }) || "";
    const normalizedIdCardNumber = canEditElderSensitiveInfo ? normalizeIdCardNumber(form.idCardNumber) : "";
    const idCardBirthDate = extractBirthDateFromIdCard(normalizedIdCardNumber);

    const payload = {
      ...form,
      ...(elderIdForSave ? { id: elderIdForSave } : {}),
      age: form.birthDate ? calculateAge(form.birthDate) || "" : currentElder?.age || "",
      birthDate: form.birthDate || "",
      birthday: compatibilityBirthday,
      careDate: currentElder?.careDate || "",
      idCardNumber: canEditElderSensitiveInfo ? normalizedIdCardNumber : currentElder?.idCardNumber || "",
      idCardLast4: canEditElderSensitiveInfo ? getIdCardLast4(normalizedIdCardNumber) : currentElder?.idCardLast4 || "",
      idCardUpdatedAt: canEditElderSensitiveInfo ? new Date().toISOString() : currentElder?.idCardUpdatedAt || "",
      idCardUpdatedBy: canEditElderSensitiveInfo ? user?.id || currentElder?.idCardUpdatedBy || "" : currentElder?.idCardUpdatedBy || "",
      avatar: form.avatar || getChineseElderAvatar(elderIdForSave, form.gender),
      avatarDataUrl: form.avatar || "",
      favoriteTopics: parseTagInput(form.favoriteTopics),
      avoidTopics: parseTagInput(form.avoidTopics),
      tags: Array.isArray(form.tags) ? form.tags : [],
      nextSuggestion: normalizeNextSuggestion(form.nextSuggestion),
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = await saveElder(payload);
      clearElderFormDraft(saved.id || draftKeyId);
      clearElderFormDraft("");
      setIsDirty(false);
      navigate(`/elders/${saved.id}`);
    } catch {
      window.alert("长者档案保存失败，请稍后重试。");
    }
  };

  if (!canEditElders) {
    return <PermissionDenied />;
  }

  if (!initialLoading && elderId && !currentElder) {
    return (
      <section className="space-y-4">
        <SectionCard title="知老卡编辑" note="当前页面无法正常加载该长者信息。">
          <p className="rounded-[24px] bg-app-orangeSoft px-4 py-4 text-base font-bold leading-7 text-app-orange">
            未找到该长者信息
          </p>
        </SectionCard>
        <button
          type="button"
          onClick={() => navigate("/elders")}
          className="primary-btn w-full"
        >
          返回长者列表
        </button>
      </section>
    );
  }

  return (
    <form className="space-y-6 pb-2" onSubmit={handleSubmit}>
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <h1 className="text-3xl font-extrabold text-app-ink">
          {currentElder ? "编辑知老卡" : "创建知老卡"}
        </h1>
        <p className="mt-2 text-lg leading-8 text-app-muted">
          人工填写真实信息，AI 整理成可服务的知老卡。
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm font-bold text-app-muted">
          <span className="rounded-2xl bg-app-cream px-2 py-3">1. 填事实</span>
          <span className="rounded-2xl bg-app-orangeSoft px-2 py-3 text-app-ink">2. AI 生成</span>
          <span className="rounded-2xl bg-app-green px-2 py-3 text-app-ink">3. 确认保存</span>
        </div>
        <p className="mt-4 rounded-2xl bg-app-cream px-4 py-3 text-base font-bold leading-7 text-app-ink">
          人工填写事实，AI 生成方法，人工确认保存。
        </p>
        <p className="mt-3 rounded-2xl bg-app-orangeSoft px-4 py-3 text-sm font-bold leading-6 text-app-ink">
          体验阶段请使用模拟或脱敏信息，请勿录入身份证号、详细病史、家庭纠纷、财产情况等敏感信息。
        </p>
        {draftNotice ? (
          <p className="mt-3 rounded-2xl bg-app-green px-4 py-3 text-sm font-bold leading-6 text-app-ink">
            {draftNotice}
          </p>
        ) : null}
        {isGenerating ? (
          <p className="mt-3 text-center text-sm font-bold leading-6 text-app-orange">
            AI 正在整理知老卡...
          </p>
        ) : null}
        {!isGenerating && aiNotice ? (
          <p className="mt-3 text-center text-sm font-bold leading-6 text-app-orange">
            {aiNotice}
          </p>
        ) : null}
      </section>

      {initialLoading ? (
        <section className="rounded-[24px] bg-app-cream p-4 text-base font-bold leading-7 text-app-ink">
          正在读取长者档案...
        </section>
      ) : null}

      {refreshing ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步长者档案...
        </section>
      ) : null}

      {error || saveError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {error || saveError}
        </section>
      ) : null}

      <SectionCard title="基础信息" note="只填写确定的信息；年龄将根据出生日期自动计算。">
        <div className="space-y-5">
          <FormField label="头像照片" hint="可选，保存在本机浏览器中。">
            <div className="flex items-center gap-4 rounded-[24px] bg-app-cream p-4">
              <img
                src={form.avatar || getChineseElderAvatar(currentElder?.id || form.name || "preview", form.gender)}
                alt="长者头像预览"
                className="h-20 w-20 shrink-0 rounded-[24px] object-cover"
              />
              <div className="min-w-0 flex-1">
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="text-sm" />
                <p className="mt-2 text-xs font-medium leading-5 text-app-muted">
                  上传后会用于长者列表和知老卡头像显示。
                </p>
                {form.avatar ? (
                  <button
                    type="button"
                    onClick={clearAvatar}
                    className="mt-3 rounded-2xl bg-app-white px-3 py-2 text-sm font-bold text-app-orange"
                  >
                    使用默认头像
                  </button>
                ) : null}
              </div>
            </div>
          </FormField>

          <FormField label="姓名" error={errors.name}>
            <TextInput
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="例如：王秀兰"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="出生日期" error={errors.birthDate}>
              <TextInput
                type="date"
                value={form.birthDate || ""}
                onChange={(event) => updateField("birthDate", event.target.value)}
              />
            </FormField>
            <FormField label="系统计算年龄">
              <div className="rounded-[22px] bg-app-cream px-4 py-3 text-lg font-extrabold text-app-ink">
                {formatAge(form.birthDate)}
              </div>
            </FormField>
            <FormField label="性别">
              <select
                className="text-lg"
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value)}
              >
                <option value="女">女</option>
                <option value="男">男</option>
              </select>
            </FormField>
          </div>

          <FormField label="称呼">
            <TextInput
              value={form.nickname}
              onChange={(event) => updateField("nickname", event.target.value)}
              placeholder="例如：秀兰阿姨"
            />
          </FormField>
          <FormField label="所属门店" hint="仅作为机构内部记录，不涉及门店管理。">
            <TextInput
              value={form.storeName}
              onChange={(event) => updateField("storeName", event.target.value)}
              placeholder="请输入所属门店或服务点名称"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="联系信息" note="用于机构内部服务联系，志愿者端会做隐私保护。">
        <div className="space-y-5">
          <FormField label="老人联系电话">
            <TextInput
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="例如：13812345678"
            />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="紧急联系人姓名">
              <TextInput
                value={form.emergencyContactName}
                onChange={(event) => updateField("emergencyContactName", event.target.value)}
                placeholder="例如：王敏"
              />
            </FormField>
            <FormField label="紧急联系人电话">
              <TextInput
                value={form.emergencyContactPhone}
                onChange={(event) => updateField("emergencyContactPhone", event.target.value)}
                placeholder="例如：13900000000"
              />
            </FormField>
          </div>
          <FormField label="与老人关系">
            <TextInput
              value={form.emergencyContactRelationship}
              onChange={(event) => updateField("emergencyContactRelationship", event.target.value)}
              placeholder="例如：子女、配偶、亲属、邻居"
            />
          </FormField>
          <FormField label="住址">
            <TextArea
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="例如：某街道某小区，体验阶段请尽量脱敏。"
            />
          </FormField>
          <FormField label="联系方式备注">
            <TextInput
              value={form.contactNote}
              onChange={(event) => updateField("contactNote", event.target.value)}
              placeholder="例如：优先联系女儿，上午接电话方便"
            />
          </FormField>
          <FormField label="其他联系方式">
            <TextArea
              value={form.otherContactInfo}
              onChange={(event) => updateField("otherContactInfo", event.target.value)}
              placeholder="例如：备用电话、微信号、家属联系方式、社区联系人等"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="健康与照护" note="服务注意事项摘要会展示给志愿者，身体情况仅供机构内部查看。">
        <div className="space-y-5">
          <FormField label="身体情况">
            <TextArea
              value={form.healthCondition}
              onChange={(event) => updateField("healthCondition", event.target.value)}
              placeholder="例如：慢病、行动能力、听力视力、过敏、用药注意等。"
            />
          </FormField>
          <FormField label="服务注意事项摘要">
            <TextArea
              value={form.careNotesPublic}
              onChange={(event) => updateField("careNotesPublic", event.target.value)}
              placeholder="例如：老人听力较弱，说话需慢；不宜久站。"
            />
          </FormField>
        </div>
      </SectionCard>

      {canEditElderSensitiveInfo ? (
        <SectionCard title="身份信息｜仅机构服务人员可见" note="身份证号属于敏感信息，仅机构管理员和服务人员可见，不会用于 AI 生成、公开展示或成果简报。">
          <div className="space-y-5">
            <FormField label="身份证号码" error={errors.idCardNumber}>
              <TextInput
                value={form.idCardNumber}
                onChange={(event) => updateField("idCardNumber", event.target.value)}
                placeholder="请输入18位身份证号码，仅机构内部可见"
              />
            </FormField>
            {hasIdCardBirthDateMismatch ? (
              <p className="rounded-[20px] bg-app-orangeSoft px-4 py-3 text-sm font-bold leading-6 text-app-orange">
                身份证号中的出生日期与已填出生日期不一致，请确认。
              </p>
            ) : null}
            <FormField label="内部备注">
              <TextArea
                value={form.privateNotes}
                onChange={(event) => updateField("privateNotes", event.target.value)}
                placeholder="仅机构内部可见，志愿者不可见。"
              />
            </FormField>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="人生与兴趣" note="这些是 AI 生成画像和聊天话题的事实依据。">
        <div className="space-y-5">
          <FormField label="原职业">
            <TextInput
              value={form.formerJob}
              onChange={(event) => updateField("formerJob", event.target.value)}
              placeholder="例如：供销社营业员"
            />
          </FormField>
          <FormField label="人生经历">
            <TextArea
              value={form.lifeExperience}
              onChange={(event) => updateField("lifeExperience", event.target.value)}
              placeholder="例如：年轻时在供销社工作，后来常帮社区组织活动。"
            />
          </FormField>
          <FormField label="兴趣爱好">
            <TextArea
              value={form.interests}
              onChange={(event) => updateField("interests", event.target.value)}
              placeholder="例如：种花、听戏、整理旧照片"
            />
          </FormField>
          <FormField label="喜欢聊的话题">
            <TextArea
              value={form.favoriteTopics}
              onChange={(event) => updateField("favoriteTopics", event.target.value)}
              placeholder="例如：家人近况、年轻时的工作、阳台花草"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="沟通与注意" note="这里只填写原始信息，AI 会在下方整理成方法。">
        <div className="space-y-5">
          <FormField label="避免话题">
            <TextArea
              value={form.avoidTopics}
              onChange={(event) => updateField("avoidTopics", event.target.value)}
              placeholder="例如：邻里矛盾、住院经历、反复追问记忆细节"
            />
          </FormField>
          <FormField label="沟通方式">
            <TextArea
              value={form.communicationStyle}
              onChange={(event) => updateField("communicationStyle", event.target.value)}
              placeholder="例如：语速慢一点，先听她讲，不要频繁打断"
            />
          </FormField>
          <FormField label="家属提醒">
            <TextArea
              value={form.familyNote}
              onChange={(event) => updateField("familyNote", event.target.value)}
              placeholder="例如：女儿希望每周收到一次近况反馈"
            />
          </FormField>
          <FormField label="服务注意原始信息">
            <TextArea
              value={form.careNoteInput}
              onChange={(event) => updateField("careNoteInput", event.target.value)}
              placeholder="例如：上午精神更好，外出步行不要太久"
            />
          </FormField>
          <FormField label="服务人员补充说明">
            <TextArea
              value={form.staffNote}
              onChange={(event) => updateField("staffNote", event.target.value)}
              placeholder="例如：第一次见面时比较拘谨，但聊到家人会慢慢放松。"
            />
          </FormField>
        </div>
      </SectionCard>

      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="relative flex w-full items-center justify-center gap-2 rounded-[24px] bg-app-orange px-5 py-4 text-lg font-extrabold text-transparent shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Sparkles size={22} className="shrink-0 text-white" />
          <span className="absolute inset-0 flex items-center justify-center px-5 text-white">
            {isGenerating ? "AI正在整理知老卡..." : "AI生成知老卡"}
          </span>
          {isGenerating ? "AI 生成中..." : "AI 生成知老卡"}
        </button>
        <p className="mt-3 text-center text-base leading-7 text-app-muted">
          AI 将根据以上事实信息，生成画像、沟通建议、服务注意和下次陪伴方案。
        </p>
        <p className="mt-2 text-center text-sm font-medium leading-6 text-app-muted">
          AI生成内容仅用于服务辅助，需人工确认后使用。请勿录入身份证号、详细病历、家庭纠纷、财产情况等敏感信息。
        </p>
      </section>

      <section className="rounded-[30px] bg-app-blue p-5 shadow-card">
        <div className="mb-5">
          <h2 className="text-2xl font-extrabold text-app-ink">AI 整理后的知老卡内容</h2>
          <p className="mt-2 text-base leading-7 text-app-muted">
            以下内容由 AI 生成，可人工修改后保存。
          </p>
        </div>

        <div className="space-y-5">
          <FormField label="一句话认识老人">
            <TextArea
              value={form.summary || ""}
              onChange={(event) => updateField("summary", event.target.value)}
              placeholder="点击 AI 生成知老卡后自动生成，也可以手动填写。"
            />
          </FormField>
          <FormField label="标签" hint="用逗号分隔">
            <TextInput
              value={(form.tags || []).join("，")}
              onChange={(event) => updateField("tags", parseTagInput(event.target.value))}
              placeholder="例如：爱花草，语速放慢，AI整理"
            />
          </FormField>
          <FormField label="AI 整理后的推荐话题">
            <TextArea
              value={form.aiFavoriteTopics || ""}
              onChange={(event) => updateField("aiFavoriteTopics", event.target.value)}
              placeholder="AI 会根据兴趣、经历和喜欢话题生成，也可以修改。"
            />
          </FormField>
          <FormField label="沟通建议">
            <TextArea
              value={form.communicationAdvice || ""}
              onChange={(event) => updateField("communicationAdvice", event.target.value)}
              placeholder="AI 会把沟通方式整理成探访前可读的建议。"
            />
          </FormField>
          <FormField label="服务注意整理">
            <TextArea
              value={form.careNote || ""}
              onChange={(event) => updateField("careNote", event.target.value)}
              placeholder="AI 会整理服务注意事项，也可以人工修改。"
            />
          </FormField>

          <div className="rounded-[26px] bg-app-white/80 p-4">
            <h3 className="text-xl font-extrabold text-app-ink">下次陪伴方案</h3>
            <p className="mt-1 text-sm leading-6 text-app-muted">
              保存后会在知老卡详情页以四张小卡片展示。
            </p>
            <div className="mt-4 space-y-4">
              <FormField label="开场方式">
                <TextArea
                  value={nextSuggestion.opening}
                  onChange={(event) => updateNextSuggestion("opening", event.target.value)}
                  placeholder="例如：下次可先从儿子的近况温和聊起。"
                />
              </FormField>
              <FormField label="沟通节奏">
                <TextArea
                  value={nextSuggestion.pace}
                  onChange={(event) => updateNextSuggestion("pace", event.target.value)}
                  placeholder="例如：语速放慢，一次只问一个问题。"
                />
              </FormField>
              <FormField label="注意避开">
                <TextArea
                  value={nextSuggestion.avoid}
                  onChange={(event) => updateNextSuggestion("avoid", event.target.value)}
                  placeholder="例如：不主动提邻里矛盾。"
                />
              </FormField>
              <FormField label="后续跟进">
                <TextArea
                  value={nextSuggestion.followUp}
                  onChange={(event) => updateNextSuggestion("followUp", event.target.value)}
                  placeholder="例如：建议上门探访，并记录是否需要家属留言。"
                />
              </FormField>
            </div>
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="sticky bottom-28 z-10 w-full rounded-[24px] bg-app-orange px-5 py-4 text-lg font-extrabold text-white shadow-card active:scale-[0.99] disabled:bg-app-line disabled:text-app-muted"
      >
        {saving ? "正在保存..." : "保存知老卡"}
      </button>
    </form>
  );
}

export default ElderFormPage;
