import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { dataProvider } from "../services/dataProvider";
import { getElderPreviewById } from "../services/storageService";
import { maskIdCardNumber } from "../utils/privacy";
import { formatAge } from "../utils/age";
import { formatDateTime } from "../utils/date";
import { normalizeNextSuggestion } from "../utils/nextSuggestion";

function splitTopics(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "")
    .split(/[，。;；、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractOpeningFallback(communicationAdvice = "") {
  const value = String(communicationAdvice || "").trim();
  if (!value) return "";
  const firstSentence = value.split(/[。！？!?]/)[0]?.trim() || "";
  return firstSentence || value;
}

function buildNextSuggestionSummary(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value !== "object" || Array.isArray(value)) return "";

  const parts = [value.opening, value.pace, value.followUp]
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  return parts.join("；");
}

function HintText({ children, tone = "text-app-muted" }) {
  return <p className={`text-sm font-bold leading-6 ${tone}`}>{children}</p>;
}

function TagList({ items = [], tone = "bg-app-blue text-app-ink" }) {
  if (!items.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${tone}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function CompactCard({ title, children, tone = "bg-app-white", action }) {
  return (
    <section className={`rounded-[26px] ${tone} p-4 shadow-sm`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-app-ink">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function CollapsibleCard({ title, children, tone = "bg-app-white", defaultOpen = false, action }) {
  return (
    <details open={defaultOpen} className={`rounded-[26px] ${tone} p-4 shadow-sm`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-app-ink">{title}</h2>
        {action}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function SuggestionTile({ title, content, tone }) {
  if (!String(content || "").trim()) return null;

  return (
    <div className={`rounded-[22px] ${tone} p-4`}>
      <p className="text-sm font-bold text-app-muted">{title}</p>
      <p className="mt-2 text-base leading-7 text-app-ink/90">{content}</p>
    </div>
  );
}

function SensitiveInfoCard({ elder, canViewSensitive }) {
  const [showFull, setShowFull] = useState(false);

  if (!canViewSensitive) return null;

  const fullValue = String(elder?.idCardNumber || "").trim();
  const maskedValue = fullValue ? maskIdCardNumber(fullValue) : "";

  return (
    <CompactCard
      title="身份信息"
      tone="bg-app-white"
      action={
        fullValue ? (
          <button
            type="button"
            onClick={() => setShowFull((previous) => !previous)}
            className="inline-flex items-center gap-2 text-sm font-extrabold text-app-orange"
          >
            {showFull ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showFull ? "隐藏号码" : "查看完整号码"}</span>
          </button>
        ) : null
      }
    >
      <p className="text-base font-extrabold leading-7 text-app-ink">
        {fullValue ? (showFull ? fullValue : maskedValue) : "暂未登记身份证号"}
      </p>
    </CompactCard>
  );
}

function BaseInfoCard({ elder, canViewSensitive }) {
  const storeName = String(elder?.storeName || "").trim();
  const contactNote = String(elder?.contactNote || "").trim();
  const otherContactInfo = String(elder?.otherContactInfo || "").trim();
  const hasIdentity = canViewSensitive && String(elder?.idCardNumber || "").trim();
  const hasAnySupplement =
    Boolean(hasIdentity) || Boolean(storeName) || Boolean(contactNote) || Boolean(otherContactInfo);

  return (
    <CollapsibleCard title="基础资料" tone="bg-app-white">
      {hasAnySupplement ? (
        <div className="space-y-3">
          {canViewSensitive ? <SensitiveInfoCard elder={elder} canViewSensitive={canViewSensitive} /> : null}
          {storeName ? (
            <div className="rounded-[18px] bg-app-cream px-4 py-3">
              <p className="text-sm font-bold text-app-muted">所属门店</p>
              <p className="mt-1 text-base font-extrabold leading-7 text-app-ink">{storeName}</p>
            </div>
          ) : null}
          {canViewSensitive && contactNote ? (
            <div className="rounded-[18px] bg-app-cream px-4 py-3">
              <p className="text-sm font-bold text-app-muted">联系方式备注</p>
              <p className="mt-1 text-base leading-7 text-app-ink/90">{contactNote}</p>
            </div>
          ) : null}
          {canViewSensitive && otherContactInfo ? (
            <div className="rounded-[18px] bg-app-cream px-4 py-3">
              <p className="text-sm font-bold text-app-muted">其他联系方式</p>
              <p className="mt-1 text-base leading-7 text-app-ink/90">{otherContactInfo}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <HintText>暂无补充资料</HintText>
      )}
    </CollapsibleCard>
  );
}

function EvidenceRow({ label, content }) {
  if (!String(content || "").trim()) return null;

  return (
    <div className="rounded-[22px] bg-app-white/75 px-4 py-3">
      <p className="text-sm font-bold text-app-muted">{label}</p>
      <p className="mt-2 text-base leading-7 text-app-ink/90">{content}</p>
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-app-line/70 ${className}`} />;
}

function ElderDetailSkeleton() {
  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-app-white p-4 shadow-sm">
        <SkeletonBlock className="h-5 w-28" />
      </section>

      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <SkeletonBlock className="h-20 w-20 shrink-0 rounded-[24px]" />
          <div className="min-w-0 flex-1 space-y-3">
            <SkeletonBlock className="h-8 w-40" />
            <SkeletonBlock className="h-5 w-24" />
            <div className="flex flex-wrap gap-2">
              <SkeletonBlock className="h-8 w-20" />
              <SkeletonBlock className="h-8 w-16" />
              <SkeletonBlock className="h-8 w-24" />
            </div>
            <SkeletonBlock className="h-4 w-36" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-12 w-full" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
      </section>

      <section className="rounded-[26px] bg-app-orangeSoft p-4 shadow-sm">
        <SkeletonBlock className="h-6 w-36" />
        <SkeletonBlock className="mt-4 h-20 w-full" />
      </section>

      <section className="rounded-[26px] bg-app-white p-4 shadow-sm">
        <SkeletonBlock className="h-6 w-32" />
        <div className="mt-4 flex flex-wrap gap-2">
          <SkeletonBlock className="h-9 w-24" />
          <SkeletonBlock className="h-9 w-20" />
          <SkeletonBlock className="h-9 w-28" />
        </div>
      </section>

      <section className="rounded-[26px] bg-app-white p-4 shadow-sm">
        <SkeletonBlock className="h-6 w-28" />
        <SkeletonBlock className="mt-4 h-24 w-full" />
      </section>

      <section className="rounded-[26px] bg-app-white p-4 shadow-sm">
        <SkeletonBlock className="h-6 w-24" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      </section>
    </div>
  );
}

function IdentityCard({ elder, canEditElders, canCreateServiceRecords }) {
  const tags = Array.isArray(elder.tags) ? elder.tags : [];

  return (
    <section className="rounded-[28px] bg-app-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <img
          src={elder.avatarUrl || elder.avatarDataUrl || elder.avatar}
          alt={elder.name}
          className="h-16 w-16 shrink-0 rounded-[20px] object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-app-ink">{elder.name || "未命名长者"}</h1>
            {elder.nickname ? (
              <span className="rounded-full bg-app-green px-2.5 py-1 text-xs font-extrabold text-app-ink">
                {elder.nickname}
              </span>
            ) : null}
            {elder.isDemo ? (
              <span className="rounded-full bg-app-cream px-2.5 py-1 text-xs font-extrabold text-app-muted">
                示例知老卡
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-bold text-app-muted">
            {formatAge(elder.birthDate)} · {elder.gender || "性别未填"}
          </p>
          <div className="mt-2">
            <TagList items={tags} tone="bg-app-cream text-app-ink" />
          </div>
          <p className="mt-2 text-xs font-bold text-app-muted">
            最近更新时间：{formatDateTime(elder.updatedAt)}
          </p>
        </div>
      </div>

      <div className={`mt-4 grid gap-2 ${canEditElders ? "grid-cols-2" : "grid-cols-1"}`}>
        {canEditElders ? (
          <Link to={`/elders/${elder.id}/edit`} className="secondary-btn min-h-11 text-sm">
            编辑知老卡
          </Link>
        ) : null}
        {canCreateServiceRecords ? (
          <Link to={`/records?elderId=${elder.id}&mode=new`} className="primary-btn min-h-11 text-sm">
            新增服务记录
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function ServiceLoop({
  elderId,
  opportunities,
  records,
  opportunitiesLoading,
  recordsLoading,
  opportunitiesError,
  recordsError,
  canCreateServiceRecords,
}) {
  const pendingCount = opportunities.filter((item) => item.status === "pending").length;
  const latestRecord = [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  return (
    <CompactCard
      title="服务闭环"
      tone="bg-app-white"
      action={
        opportunitiesLoading || recordsLoading ? (
          <span className="text-xs font-bold text-app-muted">
            {opportunitiesLoading && recordsLoading
              ? "正在同步服务数据..."
              : opportunitiesLoading
                ? "正在加载服务机会..."
                : "正在加载服务记录..."}
          </span>
        ) : null
      }
    >
      {opportunitiesError || recordsError ? (
        <div className="mb-3 rounded-[20px] bg-app-orangeSoft px-4 py-3 text-sm font-bold leading-6 text-app-orange">
          {opportunitiesError || recordsError}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-[18px] bg-app-cream px-4 py-3">
          <p className="text-sm font-bold text-app-muted">待处理机会</p>
          <p className="mt-1 text-lg font-extrabold text-app-ink">
            {opportunitiesLoading ? "..." : pendingCount}
          </p>
        </div>
        <div className="rounded-[18px] bg-app-cream px-4 py-3">
          <p className="text-sm font-bold text-app-muted">最近服务</p>
          <p className="mt-1 text-sm font-extrabold leading-6 text-app-ink">
            {recordsLoading
              ? "正在加载..."
              : latestRecord
                ? formatDateTime(latestRecord.createdAt)
                : "暂无服务记录"}
          </p>
        </div>
        <div className="rounded-[18px] bg-app-cream px-4 py-3">
          <p className="text-sm font-bold text-app-muted">最近类型</p>
          <p className="mt-1 text-sm font-extrabold leading-6 text-app-ink">
            {recordsLoading ? "正在加载..." : latestRecord?.serviceType || "暂无"}
          </p>
        </div>
      </div>

      <div className={`mt-3 grid gap-2 ${canCreateServiceRecords ? "grid-cols-2" : "grid-cols-1"}`}>
        {canCreateServiceRecords ? (
          <Link to={`/records?elderId=${elderId}&mode=new`} className="primary-btn min-h-11 text-sm">
            新增服务记录
          </Link>
        ) : null}
        <Link to="/opportunities" className="secondary-btn min-h-11 text-sm">
          查看服务机会
        </Link>
      </div>
    </CompactCard>
  );
}

function mergePreviewWithFull(preview, full) {
  if (!preview) return full;
  if (!full) return preview;
  return {
    ...preview,
    ...full,
    tags: Array.isArray(full.tags) && full.tags.length ? full.tags : preview.tags || [],
  };
}

function ElderDetailPage() {
  const { elderId } = useParams();
  const location = useLocation();
  const { canEditElders, canCreateServiceRecords, canViewElderSensitiveInfo } = useAuthData();
  const [elder, setElder] = useState(() => location.state?.elderPreview || getElderPreviewById(elderId));
  const [elderLoading, setElderLoading] = useState(true);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [records, setRecords] = useState([]);
  const [elderError, setElderError] = useState("");
  const [opportunitiesError, setOpportunitiesError] = useState("");
  const [recordsError, setRecordsError] = useState("");

  useEffect(() => {
    let active = true;
    const previewFromRoute = location.state?.elderPreview || null;
    const previewFromCache = getElderPreviewById(elderId);
    const initialPreview = previewFromRoute || previewFromCache || null;

    setElder(initialPreview);
    setElderError("");
    setOpportunitiesError("");
    setRecordsError("");
    setElderLoading(true);
    setOpportunitiesLoading(true);
    setRecordsLoading(true);
    setOpportunities([]);
    setRecords([]);

    async function load() {
      const elderPromise = Promise.resolve(dataProvider.getElderById(elderId));
      const opportunitiesPromise = Promise.resolve(
        dataProvider.getServiceOpportunitiesByElderId
          ? dataProvider.getServiceOpportunitiesByElderId(elderId)
          : dataProvider.getServiceOpportunities().then((items) => items.filter((item) => item.elderId === elderId))
      );
      const recordsPromise = Promise.resolve(
        dataProvider.getServiceRecordsByElderId
          ? dataProvider.getServiceRecordsByElderId(elderId)
          : dataProvider.getServiceRecords().then((items) => items.filter((item) => item.elderId === elderId))
      );

      const [elderResult, opportunitiesResult, recordsResult] = await Promise.allSettled([
        elderPromise,
        opportunitiesPromise,
        recordsPromise,
      ]);

      if (!active) return;

      if (elderResult.status === "fulfilled") {
        setElder(mergePreviewWithFull(initialPreview, elderResult.value));
        setElderError("");
      } else {
        console.error(elderResult.reason);
        setElder((current) => current || initialPreview);
        setElderError(
          initialPreview
            ? "完整知老卡同步失败，请稍后重试。"
            : "未找到该长者档案，可能已被删除或当前账号无权限查看。"
        );
      }
      setElderLoading(false);

      if (opportunitiesResult.status === "fulfilled") {
        setOpportunities(opportunitiesResult.value || []);
        setOpportunitiesError("");
      } else {
        console.error(opportunitiesResult.reason);
        setOpportunities([]);
        setOpportunitiesError("服务机会加载失败，请稍后重试。");
      }
      setOpportunitiesLoading(false);

      if (recordsResult.status === "fulfilled") {
        setRecords(recordsResult.value || []);
        setRecordsError("");
      } else {
        console.error(recordsResult.reason);
        setRecords([]);
        setRecordsError("服务记录加载失败，请稍后重试。");
      }
      setRecordsLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [elderId, location.state]);

  const summary = String(elder?.summary || "").trim();
  const nextSuggestion = elder?.nextSuggestion;
  const normalizedNextSuggestion = normalizeNextSuggestion(nextSuggestion);
  const openingSuggestion =
    normalizedNextSuggestion.opening || extractOpeningFallback(elder?.communicationAdvice);
  const favoriteTopics = splitTopics(elder?.favoriteTopics);
  const fallbackTopics = Array.isArray(elder?.tags) ? elder.tags : [];
  const avoidTopics = splitTopics(elder?.avoidTopics).join("、");
  const communicationAdvice = String(elder?.communicationAdvice || elder?.communicationStyle || "").trim();
  const careNote = String(elder?.careNote || "").trim();
  const nextSuggestionSummary = buildNextSuggestionSummary(nextSuggestion);
  const hasStructuredNextSuggestion = Boolean(
    nextSuggestion && typeof nextSuggestion === "object" && !Array.isArray(nextSuggestion)
  );
  const hasAnyData = Boolean(elder?.id);

  const evidenceItems = useMemo(
    () => [
      ["原职业", elder?.formerJob],
      ["人生经历", elder?.lifeExperience],
      ["兴趣爱好", elder?.interests],
      ["家属提醒", elder?.familyNote],
      ["服务人员补充说明", elder?.staffNote],
      ["服务注意原始信息", elder?.careNoteInput],
    ].filter(([, content]) => String(content || "").trim()),
    [elder]
  );

  if (!hasAnyData && elderLoading) {
    return <ElderDetailSkeleton />;
  }

  if (!hasAnyData && !elderLoading) {
    return (
      <section className="space-y-4">
        <EmptyState
          title="未找到该长者档案"
          note="可能已被删除或当前账号无权限查看。"
        />
        <Link to="/elders" className="primary-btn w-full">
          返回长者列表
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-app-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link to="/elders" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-app-orange">
              <ChevronLeft size={16} />
              返回长者列表
            </Link>
            <h1 className="mt-1 text-2xl font-extrabold text-app-ink">知老卡详情</h1>
          </div>
        </div>
      </section>

      {elderLoading ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步完整知老卡...
        </section>
      ) : null}

      {elderError && hasAnyData ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-sm font-bold leading-6 text-app-orange">
          {elderError}
        </section>
      ) : null}

      <IdentityCard
        elder={elder}
        canEditElders={canEditElders}
        canCreateServiceRecords={canCreateServiceRecords}
      />

      <BaseInfoCard elder={elder} canViewSensitive={canViewElderSensitiveInfo} />

      <CompactCard title="AI知老卡" tone="bg-app-white">
        <div className="space-y-3">
          <div className="rounded-[20px] bg-app-orangeSoft px-4 py-3">
            <p className="text-sm font-bold text-app-muted">一句话认识老人</p>
            {summary ? (
              <p className="mt-1 text-base font-extrabold leading-7 text-app-ink">{summary}</p>
            ) : (
              <HintText>暂无一句话画像，可以先结合兴趣和最近记录了解老人状态。</HintText>
            )}
          </div>

          <div className="rounded-[20px] bg-app-white px-4 py-3">
            <p className="text-sm font-bold text-app-muted">可以聊什么</p>
            {favoriteTopics.length ? (
              <TagList items={favoriteTopics} tone="bg-app-green text-app-ink" />
            ) : fallbackTopics.length ? (
              <TagList items={fallbackTopics} tone="bg-app-green text-app-ink" />
            ) : (
              <HintText>暂无明确话题提示，可先从最近生活、天气、饮食或熟悉兴趣开始。</HintText>
            )}
          </div>

          <div className="rounded-[20px] bg-app-blue px-4 py-3">
            <p className="text-sm font-bold text-app-muted">怎么聊</p>
            {communicationAdvice ? (
              <p className="mt-1 text-base leading-7 text-app-ink/90">{communicationAdvice}</p>
            ) : openingSuggestion ? (
              <p className="mt-1 text-base leading-7 text-app-ink/90">{openingSuggestion}</p>
            ) : (
              <HintText>暂无沟通建议，交流时可先放慢语速，多倾听、少追问。</HintText>
            )}
          </div>

          <div className="rounded-[20px] bg-app-cream px-4 py-3">
            <p className="text-sm font-bold text-app-muted">注意避开</p>
            {avoidTopics ? (
              <p className="mt-1 text-base leading-7 text-app-ink/90">{avoidTopics}</p>
            ) : (
              <HintText>暂无特别避开话题，服务中仍需尊重老人感受。</HintText>
            )}
          </div>

          <div className="rounded-[20px] bg-app-cream px-4 py-3">
            <p className="text-sm font-bold text-app-muted">服务注意</p>
            {careNote ? (
              <p className="mt-1 text-base leading-7 text-app-ink/90">{careNote}</p>
            ) : (
              <HintText>暂无明确服务注意，现场仍需根据老人状态灵活调整节奏。</HintText>
            )}
          </div>
        </div>
      </CompactCard>

      <CollapsibleCard title="下次陪伴建议" tone="bg-app-white">
        <div className="space-y-3">
          <div className="rounded-[20px] bg-app-cream px-4 py-3">
            <p className="text-sm font-bold text-app-muted">建议摘要</p>
            <p className="mt-1 text-base leading-7 text-app-ink/90">
              {nextSuggestionSummary || "暂无下次陪伴建议"}
            </p>
          </div>

          {hasStructuredNextSuggestion ? (
            <details className="rounded-[20px] bg-app-white/80 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-extrabold text-app-orange">
                展开完整方案 / 收起完整方案
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <SuggestionTile title="开场方式" content={normalizedNextSuggestion.opening} tone="bg-app-orangeSoft" />
                <SuggestionTile title="沟通节奏" content={normalizedNextSuggestion.pace} tone="bg-app-blue" />
                <SuggestionTile title="注意避开" content={normalizedNextSuggestion.avoid} tone="bg-app-cream" />
                <SuggestionTile title="后续跟进" content={normalizedNextSuggestion.followUp} tone="bg-app-cream" />
              </div>
            </details>
          ) : null}
        </div>
      </CollapsibleCard>

      <ServiceLoop
        elderId={elderId}
        opportunities={opportunities}
        records={records}
        opportunitiesLoading={opportunitiesLoading}
        recordsLoading={recordsLoading}
        opportunitiesError={opportunitiesError}
        recordsError={recordsError}
        canCreateServiceRecords={canCreateServiceRecords}
      />

      <details className="rounded-[26px] bg-app-cream p-4 shadow-sm">
        <summary className="cursor-pointer text-lg font-extrabold text-app-ink">
          生成依据｜人工填写信息
        </summary>
        <div className="mt-4 space-y-3">
          {evidenceItems.length ? (
            evidenceItems.map(([label, content]) => (
              <EvidenceRow key={label} label={label} content={content} />
            ))
          ) : (
            <HintText>当前还没有更多人工填写依据，可在编辑知老卡后补充。</HintText>
          )}
        </div>
      </details>
    </div>
  );
}

export default ElderDetailPage;
