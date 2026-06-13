import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DismissOpportunityDialog from "../../components/DismissOpportunityDialog";
import EmptyState from "../../components/EmptyState";
import { useAuthData } from "../../hooks/useAuthData.jsx";
import { useServiceData } from "../../hooks/useServiceData";
import {
  getOpportunitySourceBadgeClass,
  getOpportunitySourceLabel,
  normalizeOpportunitySource,
} from "../../utils/opportunitySource";

const filters = [
  { label: "全部", value: "all" },
  { label: "待处理", value: "pending" },
  { label: "我负责的", value: "mine" },
  { label: "未分配", value: "unassigned" },
  { label: "已完成", value: "completed" },
  { label: "已关闭", value: "dismissed" },
];

const sourceFilters = [
  { label: "全部", value: "all" },
  { label: "AI建议", value: "ai" },
  { label: "系统提醒", value: "rule" },
  { label: "人工创建", value: "manual" },
];

const statusLabel = {
  pending: "待处理",
  completed: "已完成",
  dismissed: "已关闭",
};

function OrgOpportunitiesPage() {
  const {
    elders,
    opportunities,
    dismissOpportunity,
    refreshing,
    initialLoading,
    dismissError,
    readErrors,
  } = useServiceData();
  const { canCloseOpportunities, canCreateServiceOpportunities, isVolunteer, user } = useAuthData();
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState(() => (isVolunteer ? "mine" : "all"));
  const [activeSourceFilter, setActiveSourceFilter] = useState("all");
  const [dismissTarget, setDismissTarget] = useState(null);
  const [dismissReason, setDismissReason] = useState("");
  const [showRefreshingBanner, setShowRefreshingBanner] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState("");

  const filtered = useMemo(() => {
    const activeElderIds = new Set(
      elders.filter((elder) => elder.status !== "archived").map((elder) => elder.id)
    );
    return opportunities.filter((item) => {
      if (isVolunteer && item.assignedToUserId !== user?.id) return false;
      if (activeSourceFilter !== "all" && normalizeOpportunitySource(item.source) !== activeSourceFilter) {
        return false;
      }
      if (activeFilter === "mine" && item.assignedToUserId !== user?.id) return false;
      if (activeFilter === "unassigned" && item.assignedToUserId) return false;
      if (!["all", "mine", "unassigned"].includes(activeFilter) && item.status !== activeFilter) return false;
      if (item.status === "pending") return activeElderIds.has(item.elderId);
      return true;
    });
  }, [activeFilter, activeSourceFilter, elders, isVolunteer, opportunities, user?.id]);

  useEffect(() => {
    if (!refreshing) {
      setShowRefreshingBanner(false);
      return undefined;
    }

    setShowRefreshingBanner(true);
    setRefreshNotice("");

    const timeout = window.setTimeout(() => {
      setShowRefreshingBanner(false);
      if (opportunities.length > 0) {
        setRefreshNotice("后台同步较慢，已显示本地或已加载数据。");
      }
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, [opportunities.length, refreshing]);

  const confirmDismiss = async () => {
    if (!canCloseOpportunities) return;
    if (!dismissTarget || !dismissReason) return;
    const ok = await dismissOpportunity(dismissTarget.id, dismissReason);
    if (!ok) return;
    setDismissTarget(null);
    setDismissReason("");
  };

  const elderName = (elderId) =>
    elders.find((elder) => elder.id === elderId)?.name || "未匹配长者";

  return (
    <div className="space-y-4">
      <section className="panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const active = activeFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-[20px] px-4 py-3 text-sm font-extrabold ${
                      active ? "bg-app-orange text-white" : "bg-app-cream text-app-muted"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {sourceFilters.map((filter) => {
                const active = activeSourceFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveSourceFilter(filter.value)}
                    className={`rounded-[20px] px-4 py-3 text-sm font-extrabold ${
                      active ? "bg-app-blue text-app-ink" : "bg-app-cream text-app-muted"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
          {canCreateServiceOpportunities ? (
            <Link to="/org/opportunities/new" className="primary-btn min-h-12">
              新增服务提醒
            </Link>
          ) : null}
        </div>
      </section>

      <section className="rounded-[22px] bg-app-cream px-4 py-3 text-sm font-bold leading-6 text-app-ink">
        AI 建议仅作服务参考，请结合实际情况确认。人工创建机会代表机构人员主动安排。
      </section>

      {location.state?.notice ? (
        <section className="rounded-[24px] bg-app-green p-4 text-base font-bold leading-7 text-app-ink">
          {location.state.notice}
        </section>
      ) : null}

      {readErrors.opportunities || dismissError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {dismissError || readErrors.opportunities}
        </section>
      ) : null}

      {showRefreshingBanner ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步服务机会...
        </section>
      ) : null}

      {refreshNotice ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-sm font-bold leading-6 text-app-orange">
          {refreshNotice}
        </section>
      ) : null}

      <section className="hidden overflow-hidden rounded-[28px] border border-app-line bg-app-white shadow-sm lg:block">
        {initialLoading ? (
          <div className="p-4">
            <EmptyState title="正在加载服务机会" note="请稍候。" />
          </div>
        ) : filtered.length ? filtered.map((item) => (
          <div key={item.id} className="grid grid-cols-[1.1fr_1.2fr_1fr_auto] items-center gap-4 border-b border-app-line p-4 last:border-b-0">
            <div>
              <p className="text-sm font-bold text-app-muted">{item.type}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${getOpportunitySourceBadgeClass(item.source)}`}>
                  {getOpportunitySourceLabel(item.source)}
                </span>
              </div>
              <p className="mt-1 text-base font-extrabold leading-7">{item.title}</p>
              <p className="mt-1 text-xs font-bold text-app-muted">
                负责人：{item.assignedToName || "未分配"}
              </p>
              {normalizeOpportunitySource(item.source) === "manual" && item.createdByName ? (
                <p className="mt-1 text-xs font-bold text-app-muted">
                  创建人：{item.createdByName}
                </p>
              ) : null}
            </div>
            <p className="text-sm font-medium leading-6 text-app-ink/80">{item.description}</p>
            <div>
              <p className="text-sm font-bold text-app-muted">{elderName(item.elderId)}</p>
              <span className="mt-2 inline-flex rounded-full bg-app-orangeSoft px-3 py-1.5 text-xs font-extrabold text-app-orange">
                {statusLabel[item.status] || "待处理"}
              </span>
              {item.dismissReason ? (
                <p className="mt-2 text-xs font-bold text-app-muted">关闭原因：{item.dismissReason}</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              {item.status === "pending" ? (
                <>
                  <Link to={`/opportunities/${item.id}`} className="secondary-btn">查看</Link>
                  {canCloseOpportunities ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDismissTarget(item);
                        setDismissReason("");
                      }}
                      className="secondary-btn"
                    >
                      关闭
                    </button>
                  ) : null}
                </>
              ) : item.status === "completed" ? (
                <Link to="/records" className="secondary-btn">查看记录</Link>
              ) : (
                <span className="text-sm font-bold text-app-muted">已关闭</span>
              )}
            </div>
          </div>
        )) : (
          <div className="p-4">
            <EmptyState
              title="暂无待处理服务机会"
              note="系统会根据长者信息和服务记录，生成后续关怀提醒。"
            />
          </div>
        )}
      </section>

      <section className="space-y-3 lg:hidden">
        {initialLoading ? (
          <EmptyState title="正在加载服务机会" note="请稍候。" />
        ) : filtered.length ? filtered.map((item) => (
          <article key={item.id} className="rounded-[28px] bg-app-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-app-muted">{item.type}</span>
              <span className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${getOpportunitySourceBadgeClass(item.source)}`}>
                {getOpportunitySourceLabel(item.source)}
              </span>
              <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-extrabold text-app-orange">
                {statusLabel[item.status] || "待处理"}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-extrabold leading-8">{item.title}</h3>
            <p className="mt-2 text-base leading-7 text-app-ink/80">{item.description}</p>
            <p className="mt-3 text-sm font-bold text-app-muted">对应长者：{elderName(item.elderId)}</p>
            <p className="mt-2 text-sm font-bold text-app-muted">负责人：{item.assignedToName || "未分配"}</p>
            {normalizeOpportunitySource(item.source) === "manual" && item.createdByName ? (
              <p className="mt-2 text-sm font-bold text-app-muted">创建人：{item.createdByName}</p>
            ) : null}
            {item.dismissReason ? (
              <p className="mt-2 text-sm font-bold text-app-muted">关闭原因：{item.dismissReason}</p>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {item.status === "pending" ? (
                <>
                  <Link to={`/opportunities/${item.id}`} className="secondary-btn">查看</Link>
                  {canCloseOpportunities ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDismissTarget(item);
                        setDismissReason("");
                      }}
                      className="secondary-btn"
                    >
                      关闭
                    </button>
                  ) : null}
                </>
              ) : item.status === "completed" ? (
                <Link to="/records" className="secondary-btn col-span-2">查看记录</Link>
              ) : null}
            </div>
          </article>
        )) : (
          <EmptyState
            title="暂无待处理服务机会"
            note="系统会根据长者信息和服务记录，生成后续关怀提醒。"
          />
        )}
      </section>

      {dismissTarget ? (
        <DismissOpportunityDialog
          reason={dismissReason}
          onReasonChange={setDismissReason}
          onCancel={() => setDismissTarget(null)}
          onConfirm={confirmDismiss}
        />
      ) : null}
    </div>
  );
}

export default OrgOpportunitiesPage;
