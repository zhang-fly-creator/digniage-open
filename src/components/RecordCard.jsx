import { CheckCircle2, ClipboardList, Link2, Pencil, Trash2, UserRound } from "lucide-react";
import { formatDateTime } from "../utils/date";
import { durationStatusLabel, formatDurationHours } from "../utils/serviceDuration";

function parseNextSuggestion(value) {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || !(trimmed.startsWith("{") && trimmed.endsWith("}"))) return null;

    try {
      const parsed = JSON.parse(trimmed);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
}

function formatNextSuggestion(value) {
  if (!value) return "";

  const parsed = parseNextSuggestion(value);
  if (parsed) {
    return [
      parsed.opening ? `开场方式：${parsed.opening}` : "",
      parsed.pace ? `沟通节奏：${parsed.pace}` : "",
      parsed.avoid ? `注意避开：${parsed.avoid}` : "",
      parsed.followUp ? `后续跟进：${parsed.followUp}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return typeof value === "string" ? value : "";
}

function getReviewStatusLabel(status) {
  if (status === "confirmed") return "已生成正式服务机会";
  if (status === "ignored") return "已忽略";
  return "待确认";
}

function getCandidateIdentity(candidate) {
  return (
    candidate?.id ||
    `${candidate?.type || ""}__${candidate?.title || ""}__${candidate?.description || ""}`
  );
}

function RecordCard({
  record,
  elderName,
  sourceOpportunity,
  isOrgAdmin = false,
  isStaff = false,
  isVolunteer = false,
  currentUserId = "",
  pendingGeneratedOpportunityKey = "",
  pendingGeneratedOpportunityAction = "",
  canEdit = false,
  canDelete = false,
  onConfirmGeneratedOpportunity,
  onIgnoreGeneratedOpportunity,
  onConfirmDuration,
  onEdit,
  onDelete,
}) {
  const sourceLabel = sourceOpportunity ? `来自服务机会：${sourceOpportunity.title}` : "手动记录";
  const generatedOpportunities = Array.isArray(record.generatedOpportunities)
    ? record.generatedOpportunities
    : [];
  const formattedNextSuggestion = formatNextSuggestion(record.nextSuggestion);
  const canViewGeneratedOpportunities = !isVolunteer && (isOrgAdmin || isStaff);
  const canConfirmDuration =
    record.durationStatus === "pending" && !isVolunteer && (isOrgAdmin || isStaff);
  const showEmptyGeneratedHint =
    canViewGeneratedOpportunities &&
    Boolean(formattedNextSuggestion) &&
    generatedOpportunities.length === 0;

  return (
    <article className="w-full overflow-hidden rounded-[28px] bg-app-white p-4 shadow-sm">
      <div className="flex w-full items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-blue text-app-ink">
          <ClipboardList size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-extrabold leading-7 text-app-ink">
            {record.serviceType || "服务记录"}
          </h3>
          <p className="mt-1 break-words text-base font-bold text-app-ink">{elderName}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-bold text-app-ink">
              {record.serviceType || "未填写类型"}
            </span>
            <span className="rounded-full bg-app-green px-3 py-1.5 text-sm font-bold text-app-ink">
              {record.elderStatus || "未填写状态"}
            </span>
            <span className="rounded-full bg-app-blue px-3 py-1.5 text-sm font-bold text-app-ink">
              服务时长：{formatDurationHours(record.durationHours)}
            </span>
            <span className="rounded-full bg-app-cream px-3 py-1.5 text-sm font-bold text-app-muted">
              {durationStatusLabel(record.durationStatus)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[20px] bg-app-cream px-4 py-3 text-sm font-bold leading-6 text-app-muted">
        <Link2 size={16} className="mt-0.5 shrink-0" />
        <span className="min-w-0 break-words">本次服务来源：{sourceLabel}</span>
      </div>

      <p className="mt-4 break-words text-base leading-7 text-app-ink">{record.content}</p>

      {record.newInfo ? (
        <div className="mt-4 rounded-[22px] bg-app-cream px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold text-app-muted">
            <UserRound size={16} />
            新发现
          </p>
          <p className="mt-2 break-words text-base leading-7 text-app-ink">{record.newInfo}</p>
        </div>
      ) : null}

      {formattedNextSuggestion ? (
        <div className="mt-4 rounded-[22px] bg-app-cream px-4 py-3">
          <p className="text-sm font-bold text-app-muted">AI 下次建议</p>
          <p className="mt-2 whitespace-pre-line break-words text-base leading-7 text-app-muted">
            {formattedNextSuggestion}
          </p>
        </div>
      ) : null}

      {canViewGeneratedOpportunities && generatedOpportunities.length > 0 ? (
        <div className="mt-4 rounded-[22px] bg-app-blue px-4 py-3">
          <p className="text-sm font-bold text-app-ink">AI建议的后续服务机会</p>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            以下内容由 AI 根据本次服务记录生成，仅供机构或服务人员确认后使用。
          </p>
          <div className="mt-3 space-y-3">
            {generatedOpportunities.map((candidate) => {
              const reviewStatus = candidate.reviewStatus || "candidate";
              const canOperateCandidate =
                (reviewStatus === "candidate" || !candidate.reviewStatus) &&
                (isOrgAdmin || (isStaff && record.operatorId === currentUserId));
              const candidateIdentity = getCandidateIdentity(candidate);
              const isPending =
                pendingGeneratedOpportunityKey === candidateIdentity &&
                (pendingGeneratedOpportunityAction === "confirm" ||
                  pendingGeneratedOpportunityAction === "ignore");

              return (
                <div
                  key={candidateIdentity}
                  className="rounded-[18px] bg-app-white px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-bold text-app-ink">
                      {candidate.type || "未分类"}
                    </span>
                    <span className="rounded-full bg-app-cream px-3 py-1.5 text-sm font-bold text-app-muted">
                      {getReviewStatusLabel(reviewStatus)}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-base font-bold leading-7 text-app-ink">
                    {candidate.title || "未命名候选服务机会"}
                  </p>
                  {candidate.description ? (
                    <p className="mt-1 break-words text-sm leading-6 text-app-muted">
                      {candidate.description}
                    </p>
                  ) : null}

                  {reviewStatus === "confirmed" ? (
                    <div className="mt-3">
                      <button
                        type="button"
                        disabled
                        className="secondary-btn min-h-11 w-full gap-2 bg-app-cream text-app-muted"
                      >
                        已生成正式服务机会
                      </button>
                    </div>
                  ) : null}

                  {reviewStatus === "ignored" ? (
                    <div className="mt-3">
                      <button
                        type="button"
                        disabled
                        className="secondary-btn min-h-11 w-full gap-2 bg-app-cream text-app-muted"
                      >
                        已忽略
                      </button>
                    </div>
                  ) : null}

                  {canOperateCandidate && reviewStatus === "candidate" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onConfirmGeneratedOpportunity?.(record, candidate)}
                        className="secondary-btn min-h-11 flex-1 gap-2 disabled:bg-app-cream disabled:text-app-muted"
                      >
                        {isPending && pendingGeneratedOpportunityAction === "confirm"
                          ? "正在生成..."
                          : "生成正式服务机会"}
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onIgnoreGeneratedOpportunity?.(record, candidate)}
                        className="secondary-btn min-h-11 flex-1 gap-2 bg-app-cream text-app-orange disabled:text-app-muted"
                      >
                        {isPending && pendingGeneratedOpportunityAction === "ignore"
                          ? "处理中..."
                          : "忽略"}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {showEmptyGeneratedHint ? (
        <div className="mt-4 rounded-[22px] bg-app-cream px-4 py-3">
          <p className="text-sm leading-6 text-app-muted">
            本次 AI 分析没有生成后续服务机会。
          </p>
        </div>
      ) : null}

      {record.aiSuggestedTags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {record.aiSuggestedTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-bold text-app-ink"
            >
              AI 标签：{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-app-muted">
        <span>服务人员：{record.operatorName || "未填写"}</span>
        <span>{formatDateTime(record.createdAt)}</span>
      </div>

      {canConfirmDuration || canEdit || canDelete ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {canConfirmDuration ? (
            <button
              type="button"
              onClick={() => onConfirmDuration?.(record)}
              className="secondary-btn min-h-11 flex-1 gap-2"
            >
              <CheckCircle2 size={16} />
              确认时长
            </button>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              onClick={() => onEdit?.(record)}
              className="secondary-btn min-h-11 flex-1 gap-2"
            >
              <Pencil size={16} />
              编辑
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete?.(record)}
              className="secondary-btn min-h-11 flex-1 gap-2 bg-app-cream text-app-orange"
            >
              <Trash2 size={16} />
              删除
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default RecordCard;
