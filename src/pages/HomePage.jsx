import {
  Bell,
  CalendarHeart,
  ChevronRight,
  ClipboardList,
  HeartHandshake,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DismissOpportunityDialog from "../components/DismissOpportunityDialog";
import EmptyState from "../components/EmptyState";
import LandingHome from "../components/LandingHome";
import StaffOnboardingCard from "../components/StaffOnboardingCard";
import VolunteerOnboardingCard from "../components/VolunteerOnboardingCard";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useNewsData } from "../hooks/useNewsData";
import { useOrganizationData } from "../hooks/useOrganizationData";
import { useServiceData } from "../hooks/useServiceData";
import {
  getHomeDashboardSnapshot,
  getStaffOnboardingDismissed,
  getVolunteerOnboardingDismissed,
  setHomeDashboardSnapshot,
  setStaffOnboardingDismissed,
  setVolunteerOnboardingDismissed,
} from "../services/storageService";
import { formatAge } from "../utils/age";
import { formatDateTime } from "../utils/date";
import { shortNextSuggestion } from "../utils/nextSuggestion";
import { getOpportunitySourceBadgeClass, getOpportunitySourceLabel } from "../utils/opportunitySource";
import { newsScopeLabel, newsSourceLabel } from "./NewsListPage";

function HomeSection({ title, children }) {
  return (
    <section className="space-y-2.5">
      <h2 className="px-1 text-lg font-extrabold text-app-ink">{title}</h2>
      {children}
    </section>
  );
}

function StatTile({ icon: Icon, label, value, unit, color, syncing = false }) {
  return (
    <article className={`${color} rounded-[24px] p-3 text-app-ink shadow-sm`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold">{label}</span>
        <Icon size={20} strokeWidth={2.3} />
      </div>
      <p className="mt-3 flex items-end gap-1">
        <span className="text-2xl font-extrabold leading-none">{value}</span>
        <span className="text-sm font-bold leading-none text-app-muted">{unit}</span>
      </p>
      {syncing ? <p className="mt-2 text-xs font-bold text-app-muted">正在同步...</p> : null}
    </article>
  );
}

function FocusElderCard({ elder, syncing = false }) {
  if (!elder) {
    return (
      <div className="space-y-3">
        <EmptyState
          title="当前还没有重点长者"
          note="你可以先查看长者列表，补充一张知老卡。"
        />
        <Link to="/elders" className="secondary-btn w-full">
          查看长者列表
        </Link>
      </div>
    );
  }

  return (
    <article className="rounded-[30px] bg-app-white p-4 shadow-card">
      <div className="flex gap-3">
        <img
          src={elder.avatarUrl || elder.avatarDataUrl || elder.avatar}
          alt={elder.name}
          className="h-16 w-16 shrink-0 rounded-[22px] object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-app-ink">{elder.name}</h3>
          <p className="mt-1 text-sm font-medium text-app-muted">
            {formatAge(elder.birthDate)} · {elder.gender || "未填写"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(elder.tags || []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-app-green px-2.5 py-1 text-xs font-bold text-app-ink"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 overflow-hidden text-sm leading-6 text-app-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {elder.summary || "待 AI 整理：补充事实信息后，会生成一句话认识老人。"}
      </p>
      <p className="mt-3 overflow-hidden rounded-[20px] bg-app-orangeSoft px-3 py-2.5 text-sm leading-6 text-app-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        下次提示：{shortNextSuggestion(elder.nextSuggestion)}
      </p>

      <Link
        to={`/elders/${elder.id}`}
        className="mt-3 flex items-center justify-center gap-2 rounded-[20px] bg-app-orange px-4 py-3 text-sm font-extrabold text-white active:scale-[0.99]"
      >
        查看知老卡
        <ChevronRight size={18} />
      </Link>
      {syncing ? <p className="mt-3 text-xs font-bold text-app-muted">正在同步重点长者...</p> : null}
    </article>
  );
}

function OpportunityRow({ item, elderName, onDismiss, canClose }) {
  return (
    <article className="rounded-[22px] bg-app-white p-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
          <CalendarHeart size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${getOpportunitySourceBadgeClass(item.source)}`}>
              {getOpportunitySourceLabel(item.source)}
            </span>
            <span className="text-sm font-extrabold text-app-ink">{item.type}</span>
            <span className="text-sm font-bold text-app-muted">{elderName}</span>
          </div>
          <p className="mt-1 overflow-hidden text-sm leading-6 text-app-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {item.title}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-app-orange px-2.5 py-1.5 text-xs font-extrabold text-white">
          待处理
        </span>
      </div>
      <div className={`mt-3 grid gap-2 ${canClose ? "grid-cols-2" : "grid-cols-1"}`}>
        <Link
          to={`/opportunities/${item.id}`}
          className="flex items-center justify-center rounded-[18px] bg-app-blue px-3 py-2.5 text-sm font-extrabold text-app-ink active:scale-[0.99]"
        >
          查看
        </Link>
        {canClose ? (
          <button
            type="button"
            onClick={() => onDismiss(item)}
            className="flex items-center justify-center rounded-[18px] bg-app-cream px-3 py-2.5 text-sm font-extrabold text-app-ink active:scale-[0.99]"
          >
            关闭
          </button>
        ) : null}
      </div>
    </article>
  );
}

function RecordRow({ record, elderName }) {
  return (
    <article className="rounded-[22px] bg-app-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="overflow-hidden text-sm font-extrabold text-app-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
            {(record.operatorName || "未填写")} 服务了 {elderName}
          </h3>
          <p className="mt-1 text-xs font-medium text-app-muted">
            {formatDateTime(record.createdAt)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-app-blue px-2.5 py-1 text-xs font-bold text-app-ink">
          {record.serviceType}
        </span>
      </div>
      <p className="mt-2 overflow-hidden text-sm leading-6 text-app-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
        {record.content}
      </p>
    </article>
  );
}

function NewsRow({ post, organizationName }) {
  return (
    <Link to={`/news/${post.id}`} className="rounded-[22px] bg-app-white p-3.5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-app-blue px-2.5 py-1 text-xs font-extrabold text-app-ink">
          {newsScopeLabel(post.scope)}
        </span>
        <span className="rounded-full bg-app-orangeSoft px-2.5 py-1 text-xs font-extrabold text-app-orange">
          {post.category || "动态"}
        </span>
      </div>
      <h3 className="mt-2 break-words text-sm font-extrabold leading-6 text-app-ink">{post.title}</h3>
      <p className="mt-1 overflow-hidden break-words text-sm leading-6 text-app-ink/80 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]">
        {post.summary || post.content.slice(0, 60)}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-app-muted">
        <span>{newsSourceLabel(post, organizationName)}</span>
        <span>{formatDateTime(post.publishedAt || post.createdAt)}</span>
      </div>
    </Link>
  );
}

function countCurrentMonthRecords(records) {
  const today = new Date();
  return records.filter((record) => {
    const value = new Date(record.createdAt);
    return value.getFullYear() === today.getFullYear() && value.getMonth() === today.getMonth();
  }).length;
}

function DashboardHome() {
  const {
    elders,
    opportunities,
    records,
    dismissOpportunity,
    loading,
    dismissError,
    readErrors,
  } = useServiceData();
  const { organization } = useOrganizationData();
  const { canCloseOpportunities, isStaff, isVolunteer, user } = useAuthData();
  const { posts: newsPosts, loading: newsLoading } = useNewsData();

  const [dismissTarget, setDismissTarget] = useState(null);
  const [dismissReason, setDismissReason] = useState("");
  const [staffGuideDismissed, setStaffGuideDismissed] = useState(false);
  const [volunteerGuideDismissed, setVolunteerGuideDismissed] = useState(false);
  const [snapshot, setSnapshot] = useState(() => getHomeDashboardSnapshot());

  const activeElders = elders.filter((elder) => elder.status !== "archived");
  const activeElderIds = new Set(activeElders.map((elder) => elder.id));
  const focusElder = activeElders[0] || null;
  const recentRecords = records.slice(0, 2).map((record) => ({
    ...record,
    elderName: elders.find((elder) => elder.id === record.elderId)?.name || "未匹配长者",
  }));
  const currentOrganizationId = organization?.id || "";
  const homeNews = newsPosts
    .filter((post) => post.scope === "platform" || post.organizationId === currentOrganizationId)
    .slice(0, 2);
  const topOpportunities = opportunities
    .filter(
      (item) =>
        item.status === "pending" &&
        activeElderIds.has(item.elderId) &&
        (!isVolunteer || item.assignedToUserId === user?.id)
    )
    .slice(0, 2)
    .map((item) => ({
      ...item,
      elderName: activeElders.find((elder) => elder.id === item.elderId)?.name || "未匹配长者",
    }));

  const organizationName = organization?.name || "机构空间";
  const shouldShowStaffOnboarding = isStaff && !staffGuideDismissed;
  const shouldShowVolunteerOnboarding = isVolunteer && !volunteerGuideDismissed;
  const volunteerFocusElder = isVolunteer
    ? activeElders.find((elder) => elder.id === topOpportunities[0]?.elderId) || null
    : null;
  const hasLiveServicePayload = elders.length > 0 || opportunities.length > 0 || records.length > 0 || !loading;
  const hasLiveNewsPayload = newsPosts.length > 0 || !newsLoading;

  const liveDashboard = useMemo(
    () => ({
      elderCount: activeElders.length,
      pendingOpportunityCount: topOpportunities.length,
      monthlyRecordCount: countCurrentMonthRecords(records),
      focusElder,
      opportunities: topOpportunities,
      recentRecords,
      news: homeNews,
      updatedAt: new Date().toISOString(),
    }),
    [activeElders.length, focusElder, homeNews, recentRecords, records, topOpportunities]
  );

  const hasSnapshot = Boolean(snapshot);
  const isInitialLoading = !hasSnapshot && !hasLiveServicePayload && !hasLiveNewsPayload;
  const isRefreshing = !isInitialLoading && (loading || newsLoading);
  const displayDashboard = {
    elderCount: hasLiveServicePayload ? liveDashboard.elderCount : snapshot?.elderCount ?? null,
    pendingOpportunityCount: hasLiveServicePayload
      ? liveDashboard.pendingOpportunityCount
      : snapshot?.pendingOpportunityCount ?? null,
    monthlyRecordCount: hasLiveServicePayload
      ? liveDashboard.monthlyRecordCount
      : snapshot?.monthlyRecordCount ?? null,
    focusElder: hasLiveServicePayload ? liveDashboard.focusElder : snapshot?.focusElder || null,
    opportunities: hasLiveServicePayload ? liveDashboard.opportunities : snapshot?.opportunities || [],
    recentRecords: hasLiveServicePayload ? liveDashboard.recentRecords : snapshot?.recentRecords || [],
    news: hasLiveNewsPayload ? liveDashboard.news : snapshot?.news || [],
  };
  const hasDisplayData =
    displayDashboard.elderCount !== null ||
    displayDashboard.pendingOpportunityCount !== null ||
    displayDashboard.monthlyRecordCount !== null ||
    Boolean(displayDashboard.focusElder) ||
    displayDashboard.opportunities.length > 0 ||
    displayDashboard.recentRecords.length > 0 ||
    displayDashboard.news.length > 0;

  useEffect(() => {
    setStaffGuideDismissed(getStaffOnboardingDismissed());
    setVolunteerGuideDismissed(getVolunteerOnboardingDismissed());
  }, []);

  useEffect(() => {
    if (!loading) {
      const nextSnapshot = {
        elderCount: liveDashboard.elderCount,
        pendingOpportunityCount: liveDashboard.pendingOpportunityCount,
        monthlyRecordCount: liveDashboard.monthlyRecordCount,
        focusElder: liveDashboard.focusElder,
        opportunities: liveDashboard.opportunities,
        recentRecords: liveDashboard.recentRecords,
        news: newsLoading ? snapshot?.news || [] : liveDashboard.news,
        updatedAt: new Date().toISOString(),
      };
      setSnapshot(nextSnapshot);
      setHomeDashboardSnapshot(nextSnapshot);
    }
  }, [liveDashboard, loading, newsLoading]);

  const confirmDismiss = async () => {
    if (!canCloseOpportunities) return;
    if (!dismissTarget || !dismissReason) return;
    const ok = await dismissOpportunity(dismissTarget.id, dismissReason);
    if (!ok) return;
    setDismissTarget(null);
    setDismissReason("");
  };

  const dismissStaffOnboarding = () => {
    setStaffOnboardingDismissed(true);
    setStaffGuideDismissed(true);
  };

  const dismissVolunteerOnboarding = () => {
    setVolunteerOnboardingDismissed(true);
    setVolunteerGuideDismissed(true);
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-extrabold text-app-ink">知老</h1>
          <p className="mt-1.5 text-base font-medium text-app-muted">让每一次陪伴都更懂老人</p>
          <p className="mt-2 inline-flex rounded-full bg-app-white px-3 py-1.5 text-sm font-extrabold text-app-ink shadow-sm">
            当前机构：{organizationName}
          </p>
        </div>
        <button
          type="button"
          aria-label="通知"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-white text-app-ink shadow-sm"
        >
          <Bell size={22} />
        </button>
      </header>

      {isStaff && !shouldShowStaffOnboarding ? (
        <div className="px-1">
          <Link
            to="/staff-guide"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-app-orange"
          >
            <span>服务人员指南</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      ) : null}

      {isVolunteer && !shouldShowVolunteerOnboarding ? (
        <div className="px-1">
          <Link
            to="/volunteer"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-app-orange"
          >
            <span>志愿者指南</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      ) : null}

      {shouldShowStaffOnboarding ? (
        <StaffOnboardingCard
          focusElder={displayDashboard.focusElder}
          hasPendingOpportunities={displayDashboard.opportunities.length > 0}
          onDismiss={dismissStaffOnboarding}
        />
      ) : null}

      {shouldShowVolunteerOnboarding ? (
        <VolunteerOnboardingCard
          focusElder={volunteerFocusElder}
          hasAssignedActivities={displayDashboard.opportunities.length > 0}
          hasAssignedTarget={Boolean(volunteerFocusElder)}
          hasRecords={displayDashboard.recentRecords.length > 0}
          onDismiss={dismissVolunteerOnboarding}
        />
      ) : null}

      {isRefreshing ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步首页数据...
        </section>
      ) : null}

      {!hasDisplayData && (readErrors.elders || readErrors.opportunities || readErrors.records || dismissError) ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          <p>首页数据读取失败，请稍后重试。</p>
          <button type="button" onClick={() => window.location.reload()} className="primary-btn mt-3 w-full">
            重新加载
          </button>
        </section>
      ) : null}

      {hasDisplayData && (readErrors.elders || readErrors.opportunities || readErrors.records || dismissError) ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-sm font-bold leading-6 text-app-orange">
          数据同步失败，已显示上次内容。
        </section>
      ) : null}

      <section className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={Users}
          label="在册长者"
          value={displayDashboard.elderCount ?? "..."}
          unit="人"
          color="bg-app-green"
          syncing={isRefreshing}
        />
        <StatTile
          icon={HeartHandshake}
          label="待处理机会"
          value={displayDashboard.pendingOpportunityCount ?? "..."}
          unit="条"
          color="bg-app-blue"
          syncing={isRefreshing}
        />
        <StatTile
          icon={ClipboardList}
          label="本月服务记录"
          value={displayDashboard.monthlyRecordCount ?? "..."}
          unit="条"
          color="bg-app-orangeSoft"
          syncing={isRefreshing}
        />
      </section>

      <HomeSection title="今日重点知老卡">
        {isInitialLoading ? (
          <EmptyState title="正在准备首页内容" note="请稍候。" />
        ) : (
          <FocusElderCard elder={displayDashboard.focusElder} syncing={isRefreshing} />
        )}
      </HomeSection>

      <HomeSection title="今日服务机会">
        <div className="space-y-3">
          {displayDashboard.opportunities.length ? (
            displayDashboard.opportunities.map((item) => (
              <OpportunityRow
                key={item.id}
                item={item}
                elderName={item.elderName || "未匹配长者"}
                canClose={canCloseOpportunities}
                onDismiss={(opportunity) => {
                  if (!canCloseOpportunities) return;
                  setDismissTarget(opportunity);
                  setDismissReason("");
                }}
              />
            ))
          ) : isInitialLoading ? (
            <EmptyState title="正在同步服务机会" note="请稍候。" />
          ) : (
            <div className="rounded-[20px] bg-app-white px-4 py-3 shadow-sm">
              <p className="text-sm font-extrabold text-app-ink">
                {isVolunteer ? "当前暂无分配给你的服务机会。" : "当前暂无待处理服务机会。"}
              </p>
              <p className="mt-1 text-xs font-bold leading-5 text-app-muted">
                可以先补充长者资料或填写服务记录，系统会逐步生成服务机会。
              </p>
              <Link to="/elders" className="secondary-btn mt-3 w-full">
                查看长者列表
              </Link>
            </div>
          )}
        </div>
      </HomeSection>

      <HomeSection title="知老动态">
        <div className="space-y-3">
          {displayDashboard.news.length ? (
            displayDashboard.news.map((post) => (
              <NewsRow key={post.id} post={post} organizationName={organizationName} />
            ))
          ) : isInitialLoading ? (
            <EmptyState title="正在加载动态" note="请稍候。" />
          ) : (
            <EmptyState title="暂无动态" note="后续平台和机构发布的服务消息会显示在这里。" />
          )}
          <Link to="/news" className="secondary-btn w-full text-sm">
            查看更多
          </Link>
        </div>
      </HomeSection>

      <HomeSection title="最近服务记录">
        <div className="space-y-3">
          {displayDashboard.recentRecords.length ? (
            displayDashboard.recentRecords.map((record) => (
              <RecordRow
                key={record.id}
                record={record}
                elderName={record.elderName || "未匹配长者"}
              />
            ))
          ) : isInitialLoading ? (
            <EmptyState title="正在同步服务记录" note="请稍候。" />
          ) : (
            <div className="space-y-3">
              <EmptyState
                title="暂无服务记录"
                note="完成一次探访、电话问候或活动后，可以在这里看到记录。"
              />
              <Link to="/records?mode=new" className="primary-btn w-full">
                填写服务记录
              </Link>
            </div>
          )}
        </div>
      </HomeSection>

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

function HomePage() {
  const { usingSupabaseAuth, isAuthenticated } = useAuthData();

  if (usingSupabaseAuth && !isAuthenticated) {
    return <LandingHome />;
  }

  return <DashboardHome />;
}

export default HomePage;
