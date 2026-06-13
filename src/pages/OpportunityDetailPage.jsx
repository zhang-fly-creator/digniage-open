import { CalendarHeart, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import DismissOpportunityDialog from "../components/DismissOpportunityDialog";
import EmptyState from "../components/EmptyState";
import SectionCard from "../components/SectionCard";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useServiceData } from "../hooks/useServiceData";
import { ROLE_NAMES } from "../services/authService";
import { formatAge } from "../utils/age";
import { formatDate, formatDateTime } from "../utils/date";
import {
  getOpportunitySourceBadgeClass,
  getOpportunitySourceLabel,
  normalizeOpportunitySource,
} from "../utils/opportunitySource";

const statusLabel = {
  pending: "待处理",
  completed: "已完成",
  dismissed: "已关闭",
};

function DetailBlock({ label, children }) {
  return (
    <section className="rounded-[26px] bg-app-white p-4">
      <p className="text-sm font-bold text-app-muted">{label}</p>
      <div className="mt-2 text-lg font-extrabold leading-8 text-app-ink">{children}</div>
    </section>
  );
}

function suggestedAction(type) {
  if (type === "长期未探访") return "建议本周电话问候或安排一次探访。";
  if (type === "家属留言建议" || type === "家属留言") return "建议联系家属补充近况反馈。";
  if (type === "生日关怀") return "建议安排生日问候。";
  if (type === "画像待完善") return "建议补充兴趣、经历或沟通禁忌。";
  if (type === "重点关注提醒" || type === "重点关注") return "建议增加一次陪伴或电话关怀。";
  return "建议结合知老卡内容安排一次轻量关怀。";
}

function OpportunityDetailPage() {
  const { opportunityId } = useParams();
  const {
    elders,
    opportunities,
    assignableMembers,
    assignOpportunity,
    dismissOpportunity,
    loading,
    error,
    assignOpportunityError,
    dismissError,
  } = useServiceData();
  const { canAssignOpportunities, canCloseOpportunities, canCompleteOpportunities, user } = useAuthData();
  const [showDismiss, setShowDismiss] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignMemberId, setAssignMemberId] = useState("");
  const [dismissReason, setDismissReason] = useState("");
  const opportunity = opportunities.find((item) => item.id === opportunityId);

  if (loading) {
    return <EmptyState title="正在加载服务机会" note="请稍候。" />;
  }

  if (error) {
    return (
      <EmptyState
        title="服务机会加载失败"
        note="服务机会加载失败，请检查 Supabase 配置或稍后重试。"
      />
    );
  }

  if (!opportunity) {
    return (
      <EmptyState
        title="未找到这条服务机会"
        note="可能是提醒已更新，回到服务机会列表再看看。"
      />
    );
  }

  const elder = elders.find((item) => item.id === opportunity.elderId);
  const isPending = opportunity.status === "pending";
  const isCompleted = opportunity.status === "completed";
  const isDismissed = opportunity.status === "dismissed";
  const assigneeText = opportunity.assignedToName
    ? `${opportunity.assignedToName} · ${ROLE_NAMES[opportunity.assignedRole] || opportunity.assignedRole || "成员"}`
    : "未分配";
  const canHandleOpportunity =
    canCompleteOpportunities || opportunity.assignedToUserId === user?.id;

  const confirmDismiss = async () => {
    if (!canCloseOpportunities) return;
    if (!dismissReason) return;
    const ok = await dismissOpportunity(opportunity.id, dismissReason);
    if (!ok) return;
    setShowDismiss(false);
    setDismissReason("");
  };

  const confirmAssign = async () => {
    if (!canAssignOpportunities) return;
    await assignOpportunity(opportunity.id, assignMemberId);
    setShowAssignForm(false);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-app-orange text-white">
            <CalendarHeart size={28} strokeWidth={2.3} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${getOpportunitySourceBadgeClass(opportunity.source)}`}>
                {getOpportunitySourceLabel(opportunity.source)}
              </span>
              <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-extrabold text-app-orange">
                {statusLabel[opportunity.status] || "待处理"}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-10 text-app-ink">
              {opportunity.type || "服务机会详情"}
            </h1>
            <p className="mt-2 text-base leading-7 text-app-muted">
              服务机会是系统发现的轻提醒，可关联服务记录，不是强制工单。
            </p>
          </div>
        </div>
      </section>

      {dismissError || assignOpportunityError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {assignOpportunityError || dismissError}
        </section>
      ) : null}

      <SectionCard title="服务机会详情">
        <div className="space-y-3">
          <DetailBlock label="为什么提醒">
            <span className="block">{opportunity.title}</span>
            <span className="mt-2 block text-base font-medium leading-7 text-app-ink/80">
              {opportunity.description}
            </span>
          </DetailBlock>
          <DetailBlock label="来源">{getOpportunitySourceLabel(opportunity.source)}</DetailBlock>
          <DetailBlock label="对应长者">
            {elder ? (
              <div>
                <p>{elder.name} · {formatAge(elder.birthDate)} · {elder.gender || "未填写"}</p>
                {elder.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {elder.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="pill bg-app-blue text-app-ink">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="mt-3 text-base font-medium leading-7 text-app-ink/80">
                  {elder.summary || "一句话画像待补充"}
                </p>
              </div>
            ) : (
              "未匹配长者"
            )}
          </DetailBlock>
          <DetailBlock label="建议动作">{suggestedAction(opportunity.type)}</DetailBlock>
          <DetailBlock label="负责人">{assigneeText}</DetailBlock>
          {normalizeOpportunitySource(opportunity.source) === "manual" && opportunity.createdByName ? (
            <DetailBlock label="创建人">
              {opportunity.createdByName}
              {opportunity.createdByRole
                ? ` · ${ROLE_NAMES[opportunity.createdByRole] || opportunity.createdByRole}`
                : ""}
            </DetailBlock>
          ) : null}
          <DetailBlock label="提醒时间">{formatDate(opportunity.dueDate)}</DetailBlock>
          <p className="rounded-[22px] bg-app-cream px-4 py-3 text-base font-bold leading-7 text-app-muted">
            完整沟通建议请查看知老卡。
          </p>
        </div>
      </SectionCard>

      {isCompleted ? (
        <section className="rounded-[26px] bg-app-green p-4 text-base font-bold leading-7 text-app-ink">
          已通过服务记录完成
          {opportunity.completedAt ? `，完成时间：${formatDateTime(opportunity.completedAt)}` : ""}
        </section>
      ) : null}

      {isDismissed ? (
        <section className="rounded-[26px] bg-app-cream p-4 text-base font-bold leading-7 text-app-muted">
          已关闭：{opportunity.dismissReason || "未填写关闭原因"}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-3">
        {elder ? (
          <Link to={`/elders/${elder.id}`} className="secondary-btn py-4 text-lg">
            查看知老卡
          </Link>
        ) : null}
        {isPending ? (
          <>
            {canHandleOpportunity ? (
              <Link
                to={`/records?mode=new&elderId=${opportunity.elderId}&opportunityId=${opportunity.id}&opportunityTitle=${encodeURIComponent(opportunity.title)}`}
                className="primary-btn py-4 text-lg"
              >
                去记录服务
              </Link>
            ) : null}
            {canCloseOpportunities ? (
              <button
                type="button"
                onClick={() => setShowDismiss(true)}
                className="flex w-full items-center justify-center rounded-2xl bg-app-cream px-4 py-4 text-lg font-bold text-app-ink transition active:scale-[0.99]"
              >
                关闭此机会
              </button>
            ) : null}
            {canAssignOpportunities ? (
              <button
                type="button"
                onClick={() => {
                  setAssignMemberId(opportunity.assignedToMemberId || "");
                  setShowAssignForm((previous) => !previous);
                }}
                className="secondary-btn py-4 text-lg"
              >
                更改负责人
              </button>
            ) : null}
          </>
        ) : null}
      </section>

      {showAssignForm ? (
        <section className="rounded-[30px] bg-app-white p-5 shadow-card">
          <h2 className="text-2xl font-extrabold text-app-ink">更改负责人</h2>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-app-ink">负责人</span>
            <select
              className="mt-2"
              value={assignMemberId}
              onChange={(event) => setAssignMemberId(event.target.value)}
            >
              <option value="">暂不指定</option>
              {assignableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email || "未命名成员"} · {member.roleName}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={confirmAssign} className="primary-btn">
              保存负责人
            </button>
            <button type="button" onClick={() => setShowAssignForm(false)} className="secondary-btn">
              取消
            </button>
          </div>
        </section>
      ) : null}

      <Link
        to="/opportunities"
        className="flex w-full items-center justify-center gap-2 rounded-[22px] px-5 py-3 text-base font-extrabold text-app-muted"
      >
        <Sparkles size={18} />
        返回服务机会
      </Link>

      {showDismiss ? (
        <DismissOpportunityDialog
          reason={dismissReason}
          onReasonChange={setDismissReason}
          onCancel={() => setShowDismiss(false)}
          onConfirm={confirmDismiss}
        />
      ) : null}
    </div>
  );
}

export default OpportunityDetailPage;
