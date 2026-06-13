import { Edit3 } from "lucide-react";
import { Link } from "react-router-dom";
import { buildElderPreview } from "../services/storageService";
import { formatAge } from "../utils/age";
import { formatDateTime } from "../utils/date";

function ElderCard({
  elder,
  canManage = false,
  canEdit = false,
  archived = false,
  onArchive,
  onRestore,
}) {
  const hasAiCard = Boolean(elder.summary);
  const avatarSrc = elder.avatarUrl || elder.avatarDataUrl || elder.avatar;
  const detailState = { elderPreview: buildElderPreview(elder) };

  return (
    <article className="w-full overflow-hidden rounded-[26px] border border-app-line bg-app-white p-4 shadow-sm">
      <div className="flex w-full items-start gap-3">
        <img
          src={avatarSrc}
          alt={elder.name}
          className="h-16 w-16 shrink-0 rounded-[22px] object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="break-words text-xl font-extrabold leading-7 text-app-ink">
                {elder.name}
              </h3>
              <p className="mt-1 text-sm font-bold text-app-muted">
                {formatAge(elder.birthDate)} · {elder.gender || "性别未填"}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                archived
                  ? "bg-app-cream text-app-muted"
                  : hasAiCard
                    ? "bg-app-green text-app-ink"
                    : "bg-app-orangeSoft text-app-orange"
              }`}
            >
              {archived ? "已归档" : hasAiCard ? "已生成知老卡" : "待 AI 整理"}
            </span>
          </div>

          {elder.tags?.length && !archived ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {elder.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="pill bg-app-green text-app-ink">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          {elder.storeName ? (
            <p className="mt-3 text-xs font-bold text-app-muted">
              所属门店：{elder.storeName}
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-4 break-words text-base leading-7 text-app-ink/90">
        {archived
          ? `归档原因：${elder.archivedReason || "未填写"}`
          : elder.summary || "待 AI 整理：补充事实信息后，可生成一句话画像和陪伴建议。"}
      </p>

      <p className="mt-3 text-xs font-medium leading-5 text-app-muted">
        {archived && elder.archivedAt
          ? `归档时间：${formatDateTime(elder.archivedAt)}`
          : `最近更新：${formatDateTime(elder.updatedAt)}`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/elders/${elder.id}`} state={detailState} className="secondary-btn min-h-11 flex-1">
          查看档案
        </Link>
        {canEdit && !archived ? (
          <Link to={`/elders/${elder.id}/edit`} className="secondary-btn min-h-11 flex-1 gap-1">
            <Edit3 size={16} />
            编辑
          </Link>
        ) : null}
        {canManage && !archived ? (
          <button
            type="button"
            onClick={() => onArchive?.(elder)}
            className="secondary-btn min-h-11 flex-1 bg-app-cream"
          >
            归档
          </button>
        ) : null}
        {canManage && archived ? (
          <button
            type="button"
            onClick={() => onRestore?.(elder)}
            className="secondary-btn min-h-11 flex-1"
          >
            恢复
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default ElderCard;
