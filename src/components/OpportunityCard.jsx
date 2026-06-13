import {
  BellDot,
  CalendarHeart,
  Clock3,
  Gift,
  MessageCircleHeart,
  PartyPopper,
  UserRoundSearch,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROLE_NAMES } from "../services/authService";
import { formatDate, formatDateTime } from "../utils/date";
import {
  getOpportunitySourceBadgeClass,
  getOpportunitySourceLabel,
  normalizeOpportunitySource,
} from "../utils/opportunitySource";

const typeIconMap = {
  生日关怀: Gift,
  长期未探访: Clock3,
  家属留言建议: MessageCircleHeart,
  家属留言: MessageCircleHeart,
  活动邀请建议: PartyPopper,
  活动邀请: PartyPopper,
  画像待完善: UserRoundSearch,
  重点关注提醒: BellDot,
  重点关注: BellDot,
  下次探访提醒: CalendarHeart,
};

const statusConfig = {
  pending: { label: "待处理", badgeClass: "bg-app-orangeSoft text-app-orange" },
  completed: { label: "已完成", badgeClass: "bg-app-green text-app-ink" },
  dismissed: { label: "已关闭", badgeClass: "bg-app-cream text-app-muted" },
};

function OpportunityCard({ item, elderName, onDismiss, canClose = true }) {
  const pending = item.status === "pending";
  const completed = item.status === "completed";
  const dismissed = item.status === "dismissed";
  const Icon = typeIconMap[item.type] || CalendarHeart;
  const status = statusConfig[item.status] || statusConfig.pending;
  const source = normalizeOpportunitySource(item.source);
  const assigneeText = item.assignedToName
    ? `${item.assignedToName}${item.assignedRole ? ` · ${ROLE_NAMES[item.assignedRole] || item.assignedRole}` : ""}`
    : "未分配";

  return (
    <article
      className={`w-full overflow-hidden rounded-[30px] border p-4 shadow-card ${
        pending ? "border-app-orange/50 bg-app-white" : "border-app-line bg-app-white/90"
      }`}
    >
      <div className="flex w-full items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] ${
            pending ? "bg-app-orange text-white" : "bg-app-green text-app-ink"
          }`}
        >
          <Icon size={24} strokeWidth={2.3} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-extrabold ${getOpportunitySourceBadgeClass(source)}`}>
              {getOpportunitySourceLabel(source)}
            </span>
            <span className="break-words text-sm font-extrabold text-app-muted">
              {item.type || "服务机会"}
            </span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${status.badgeClass}`}>
              {status.label}
            </span>
          </div>

          <h3 className="mt-3 break-words text-xl font-extrabold leading-8 text-app-ink">
            {item.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 break-words text-base leading-7 text-app-ink/85">
        {item.description}
      </p>

      <div className="mt-4 rounded-[22px] bg-app-cream px-4 py-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-sm font-bold text-app-muted">对应长者</p>
            <p className="mt-1 break-words text-lg font-extrabold text-app-ink">{elderName}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-app-muted">提醒时间</p>
            <p className="mt-1 text-lg font-extrabold text-app-ink">
              {formatDate(item.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-app-muted">负责人</p>
            <p className="mt-1 break-words text-lg font-extrabold text-app-ink">{assigneeText}</p>
          </div>
          {source === "manual" && item.createdByName ? (
            <div>
              <p className="text-sm font-bold text-app-muted">创建人</p>
              <p className="mt-1 break-words text-base font-extrabold text-app-ink">
                {item.createdByName}
              </p>
            </div>
          ) : null}
        </div>
        {completed && item.completedAt ? (
          <p className="mt-3 text-sm font-bold text-app-muted">
            完成时间：{formatDateTime(item.completedAt)}
          </p>
        ) : null}
        {dismissed ? (
          <p className="mt-3 break-words text-sm font-bold text-app-muted">
            关闭原因：{item.dismissReason || "未填写"}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {pending ? (
          <>
            <Link
              to={`/opportunities/${item.id}`}
              className="flex min-h-12 flex-1 items-center justify-center rounded-[22px] bg-app-blue px-5 py-3 text-base font-extrabold text-app-ink active:scale-[0.99]"
            >
              查看
            </Link>
            {canClose ? (
              <button
                type="button"
                onClick={() => onDismiss(item)}
                className="flex min-h-12 flex-1 items-center justify-center rounded-[22px] bg-app-cream px-5 py-3 text-base font-extrabold text-app-ink active:scale-[0.99]"
              >
                关闭
              </button>
            ) : null}
          </>
        ) : null}
        {completed ? (
          <Link
            to="/records"
            className="flex min-h-12 w-full items-center justify-center rounded-[22px] bg-app-blue px-5 py-3 text-base font-extrabold text-app-ink active:scale-[0.99]"
          >
            查看记录
          </Link>
        ) : null}
        {dismissed ? (
          <div className="w-full rounded-[22px] bg-app-cream px-4 py-3 text-base font-bold leading-7 text-app-muted">
            已关闭：{item.dismissReason || "未填写关闭原因"}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default OpportunityCard;
