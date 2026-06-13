import { Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DismissOpportunityDialog from "../components/DismissOpportunityDialog";
import EmptyState from "../components/EmptyState";
import OpportunityCard from "../components/OpportunityCard";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useServiceData } from "../hooks/useServiceData";
import { normalizeOpportunitySource } from "../utils/opportunitySource";

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

function OpportunitiesPage() {
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

  const [activeFilter, setActiveFilter] = useState(() => (isVolunteer ? "mine" : "all"));
  const [activeSourceFilter, setActiveSourceFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [dismissTarget, setDismissTarget] = useState(null);
  const [dismissReason, setDismissReason] = useState("");
  const [showRefreshingBanner, setShowRefreshingBanner] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState("");
  const location = useLocation();

  const activeElderIds = useMemo(
    () => new Set(elders.filter((elder) => elder.status !== "archived").map((elder) => elder.id)),
    [elders]
  );

  const elderName = (elderId) =>
    elders.find((elder) => elder.id === elderId)?.name || "未匹配长者";

  const filteredOpportunities = useMemo(() => {
    const value = keyword.trim();
    return opportunities.filter((item) => {
      if (activeFilter !== "all") {
        if (activeFilter === "mine" && item.assignedToUserId !== user?.id) return false;
        if (activeFilter === "unassigned" && item.assignedToUserId) return false;
        if (!["mine", "unassigned"].includes(activeFilter) && item.status !== activeFilter) return false;
        if (item.status === "pending" && !activeElderIds.has(item.elderId)) return false;
      }

      if (isVolunteer && item.assignedToUserId !== user?.id) return false;
      if (activeSourceFilter !== "all" && normalizeOpportunitySource(item.source) !== activeSourceFilter) {
        return false;
      }

      if (!value) return true;
      const name = elderName(item.elderId);
      return (
        name.includes(value) ||
        item.title?.includes(value) ||
        item.description?.includes(value) ||
        item.type?.includes(value)
      );
    });
  }, [activeElderIds, activeFilter, activeSourceFilter, elders, isVolunteer, keyword, opportunities, user?.id]);

  const manualCount = opportunities.filter(
    (item) => normalizeOpportunitySource(item.source) === "manual"
  ).length;

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

  const openDismissDialog = (item) => {
    if (!canCloseOpportunities) return;
    setDismissTarget(item);
    setDismissReason("");
  };

  const confirmDismiss = async () => {
    if (!dismissTarget || !dismissReason) return;
    const ok = await dismissOpportunity(dismissTarget.id, dismissReason);
    if (!ok) return;
    setDismissTarget(null);
    setDismissReason("");
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
              <Sparkles size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-extrabold text-app-ink">服务机会</h1>
              <p className="mt-2 text-lg font-medium text-app-muted">
                系统发现的关怀提醒，服务后可关联记录完成闭环。
              </p>
              <p className="mt-2 text-sm font-bold text-app-orange">
                当前 {manualCount} 条人工创建提醒
              </p>
            </div>
          </div>
          {canCreateServiceOpportunities ? (
            <Link to="/opportunities/new" className="primary-btn min-h-12 shrink-0">
              <Plus size={20} />
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

      <section className="rounded-[28px] bg-app-white p-3 shadow-sm">
        <div className="grid gap-3">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索长者姓名或机会内容"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const active = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 rounded-[22px] px-4 py-3 text-base font-extrabold transition active:scale-[0.99] ${
                    active ? "bg-app-orange text-white" : "bg-transparent text-app-muted"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sourceFilters.map((filter) => {
              const active = activeSourceFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveSourceFilter(filter.value)}
                  className={`shrink-0 rounded-[22px] px-4 py-3 text-sm font-extrabold transition active:scale-[0.99] ${
                    active ? "bg-app-blue text-app-ink" : "bg-app-cream text-app-muted"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {initialLoading ? (
          <EmptyState title="正在加载服务机会" note="请稍候。" />
        ) : filteredOpportunities.length ? (
          filteredOpportunities.map((item) => (
            <OpportunityCard
              key={item.id}
              item={item}
              elderName={elderName(item.elderId)}
              onDismiss={openDismissDialog}
              canClose={canCloseOpportunities}
            />
          ))
        ) : (
          <EmptyState
            title={activeFilter === "pending" || activeFilter === "all" ? "暂无待处理服务机会" : "暂时没有服务机会"}
            note={
              activeFilter === "pending" || activeFilter === "all"
                ? isVolunteer
                  ? "暂无分配给你的服务机会。"
                  : "系统会根据长者信息和服务记录，生成后续关怀提醒。"
                : "切换筛选条件，看看其他状态下的服务机会。"
            }
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

export default OpportunitiesPage;
