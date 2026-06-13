import { CalendarCheck, CheckCircle2, ClipboardList, Clock3, HeartHandshake } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import SectionCard from "../components/SectionCard";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useServiceData } from "../hooks/useServiceData";
import { formatDate, formatDateTime } from "../utils/date";
import {
  getOpportunitySourceBadgeClass,
  getOpportunitySourceLabel,
  normalizeOpportunitySource,
} from "../utils/opportunitySource";
import {
  durationStatusLabel,
  formatDurationHours,
  formatDurationTotal,
  sumDurationHours,
} from "../utils/serviceDuration";

function emailPrefix(email = "") {
  return String(email).split("@")[0] || "";
}

function userDisplayName(user) {
  return user?.name || emailPrefix(user?.email) || "";
}

function isCurrentUserRecord(record, user) {
  if (!user?.id) return false;
  if (record.operatorId === user.id) return true;
  if (record.operatorId) return false;

  const candidates = [user?.name, user?.email, emailPrefix(user?.email)].filter(Boolean);
  return candidates.includes(record.operatorName);
}

function isCurrentMonth(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[26px] bg-app-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
          <Icon size={22} />
        </span>
        <div>
          <p className="text-sm font-bold text-app-muted">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-app-ink">{value}</p>
        </div>
      </div>
    </div>
  );
}

function OpportunityMeta({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-app-muted">{label}</p>
      <p className="mt-1 break-words text-base font-extrabold text-app-ink">{value || "未填写"}</p>
    </div>
  );
}

function PendingOpportunityCard({ opportunity, elderName }) {
  const recordPath = `/records?mode=new&elderId=${encodeURIComponent(
    opportunity.elderId || ""
  )}&opportunityId=${encodeURIComponent(opportunity.id)}&opportunityTitle=${encodeURIComponent(
    opportunity.title || ""
  )}`;

  return (
    <article className="rounded-[28px] bg-app-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-xs font-extrabold text-app-orange">
          {opportunity.type || "服务提醒"}
        </span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${getOpportunitySourceBadgeClass(opportunity.source)}`}>
          {getOpportunitySourceLabel(opportunity.source)}
        </span>
      </div>

      <h3 className="mt-3 break-words text-xl font-extrabold leading-8 text-app-ink">
        {opportunity.title}
      </h3>

      <div className="mt-4 grid gap-3 rounded-[22px] bg-app-cream px-4 py-3 sm:grid-cols-2">
        <OpportunityMeta label="长者" value={elderName} />
        <OpportunityMeta label="截止时间" value={opportunity.dueDate ? formatDate(opportunity.dueDate) : "未设置"} />
        <OpportunityMeta label="负责人" value="我" />
        {normalizeOpportunitySource(opportunity.source) === "manual" && opportunity.createdByName ? (
          <OpportunityMeta label="创建人" value={opportunity.createdByName} />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="flex min-h-12 flex-1 items-center justify-center rounded-[22px] bg-app-blue px-5 py-3 text-base font-extrabold text-app-ink active:scale-[0.99]"
        >
          查看详情
        </Link>
        <Link
          to={recordPath}
          className="flex min-h-12 flex-1 items-center justify-center rounded-[22px] bg-app-orange px-5 py-3 text-base font-extrabold text-white active:scale-[0.99]"
        >
          去记录服务
        </Link>
      </div>
    </article>
  );
}

function CompletedOpportunityCard({ opportunity, elderName }) {
  const handleRecordClick = () => {
    window.alert("记录详情功能待完善。");
  };

  return (
    <article className="rounded-[28px] bg-app-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-app-green px-3 py-1.5 text-xs font-extrabold text-app-ink">
          已完成
        </span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${getOpportunitySourceBadgeClass(opportunity.source)}`}>
          {getOpportunitySourceLabel(opportunity.source)}
        </span>
      </div>
      <h3 className="mt-3 break-words text-lg font-extrabold leading-7 text-app-ink">
        {opportunity.title}
      </h3>
      <div className="mt-4 grid gap-3 rounded-[22px] bg-app-cream px-4 py-3 sm:grid-cols-2">
        <OpportunityMeta label="长者" value={elderName} />
        <OpportunityMeta
          label="完成时间"
          value={opportunity.completedAt ? formatDateTime(opportunity.completedAt) : "未记录"}
        />
      </div>
      <button
        type="button"
        onClick={handleRecordClick}
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-[22px] bg-app-blue px-5 py-3 text-base font-extrabold text-app-ink active:scale-[0.99]"
      >
        查看记录
      </button>
    </article>
  );
}

function MyRecordCard({ record, elderName, opportunityTitle }) {
  return (
    <article className="rounded-[28px] bg-app-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-blue text-app-ink">
          <ClipboardList size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-extrabold leading-7 text-app-ink">
            {record.serviceType || "服务记录"}
          </h3>
          <p className="mt-1 break-words text-base font-bold text-app-ink">{elderName}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-bold text-app-ink">
          {record.elderStatus || "未填写状态"}
        </span>
        <span className="rounded-full bg-app-green px-3 py-1.5 text-sm font-bold text-app-ink">
          {formatDateTime(record.createdAt)}
        </span>
        <span className="rounded-full bg-app-blue px-3 py-1.5 text-sm font-bold text-app-ink">
          服务时长：{formatDurationHours(record.durationHours)}
        </span>
        <span className="rounded-full bg-app-cream px-3 py-1.5 text-sm font-bold text-app-muted">
          {durationStatusLabel(record.durationStatus)}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 break-words text-base leading-7 text-app-ink">
        {record.content || "未填写服务内容。"}
      </p>

      {opportunityTitle ? (
        <p className="mt-4 rounded-[20px] bg-app-cream px-4 py-3 text-sm font-bold leading-6 text-app-muted">
          关联服务机会：{opportunityTitle}
        </p>
      ) : null}
    </article>
  );
}

function MyServicePage() {
  const {
    user,
    usingSupabaseAuth,
    isAuthenticated,
    hasActiveMembership,
  } = useAuthData();
  const { elders, opportunities, records, loading, refreshing, initialLoading, error, saveError } = useServiceData();

  const elderNameById = useMemo(() => {
    const map = new Map(elders.map((elder) => [elder.id, elder.name || "未知长者"]));
    return (elderId) => map.get(elderId) || "未知长者";
  }, [elders]);

  const opportunityTitleById = useMemo(() => {
    const map = new Map(opportunities.map((item) => [item.id, item.title || "服务提醒"]));
    return (opportunityId) => map.get(opportunityId) || "";
  }, [opportunities]);

  const myPendingOpportunities = useMemo(
    () =>
      opportunities.filter(
        (item) => item.assignedToUserId === user?.id && item.status === "pending"
      ),
    [opportunities, user?.id]
  );

  const myCompletedOpportunities = useMemo(
    () =>
      opportunities.filter(
        (item) => item.assignedToUserId === user?.id && item.status === "completed"
      ),
    [opportunities, user?.id]
  );

  const myRecords = useMemo(
    () => records.filter((record) => isCurrentUserRecord(record, user)),
    [records, user]
  );

  const monthlyRecordCount = useMemo(
    () => myRecords.filter((record) => isCurrentMonth(record.createdAt)).length,
    [myRecords]
  );
  const myDurationStats = useMemo(
    () => ({
      total: sumDurationHours(myRecords),
      confirmed: sumDurationHours(myRecords, "confirmed"),
      pending: sumDurationHours(myRecords, "pending"),
      count: myRecords.length,
    }),
    [myRecords]
  );

  if (usingSupabaseAuth && !isAuthenticated) {
    return (
      <SectionCard title="我的服务">
        <div className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          请先登录后查看我的服务。
        </div>
        <Link to="/auth" className="primary-btn mt-4 w-full">
          登录 / 注册
        </Link>
      </SectionCard>
    );
  }

  if (usingSupabaseAuth && isAuthenticated && !hasActiveMembership) {
    return (
      <SectionCard title="我的服务">
        <div className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          尚未加入机构，请联系机构管理员添加成员身份。
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-app-orange text-white">
            <HeartHandshake size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-app-muted">{userDisplayName(user) || "当前成员"}</p>
            <h1 className="mt-1 text-3xl font-extrabold text-app-ink">我的服务</h1>
            <p className="mt-2 text-base font-medium leading-7 text-app-muted">
              查看我负责的服务提醒和已经完成的服务记录。
            </p>
          </div>
        </div>
      </section>

      {error || saveError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {saveError || error}
        </section>
      ) : null}

      {refreshing ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步我的服务数据...
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard icon={CalendarCheck} label="我的待处理" value={myPendingOpportunities.length} />
        <StatCard icon={CheckCircle2} label="我的已完成" value={myCompletedOpportunities.length} />
        <StatCard icon={ClipboardList} label="本月服务记录" value={monthlyRecordCount} />
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <StatCard icon={Clock3} label="累计服务时长" value={formatDurationTotal(myDurationStats.total)} />
        <StatCard icon={CheckCircle2} label="已确认服务时长" value={formatDurationTotal(myDurationStats.confirmed)} />
        <StatCard icon={Clock3} label="待确认服务时长" value={formatDurationTotal(myDurationStats.pending)} />
        <StatCard icon={ClipboardList} label="服务记录次数" value={myDurationStats.count} />
      </section>

      <SectionCard title="我负责的待处理服务机会">
        <div className="space-y-4">
          {initialLoading ? (
            <EmptyState title="正在加载服务提醒" note="请稍候。" />
          ) : myPendingOpportunities.length ? (
            myPendingOpportunities.map((item) => (
              <PendingOpportunityCard
                key={item.id}
                opportunity={item}
                elderName={elderNameById(item.elderId)}
              />
            ))
          ) : (
            <EmptyState
              title="暂无分配给你的待处理服务提醒"
              note="有新的负责人提醒时，会显示在这里。"
            />
          )}
        </div>
      </SectionCard>

      <SectionCard title="我已完成的服务机会">
        <div className="space-y-4">
          {initialLoading ? (
            <EmptyState title="正在加载已完成提醒" note="请稍候。" />
          ) : myCompletedOpportunities.length ? (
            myCompletedOpportunities.map((item) => (
              <CompletedOpportunityCard
                key={item.id}
                opportunity={item}
                elderName={elderNameById(item.elderId)}
              />
            ))
          ) : (
            <EmptyState title="暂无已完成的服务提醒" note="完成服务机会后，会沉淀在这里。" />
          )}
        </div>
      </SectionCard>

      <SectionCard title="我的服务记录">
        <div className="space-y-4">
          {initialLoading ? (
            <EmptyState title="正在加载服务记录" note="请稍候。" />
          ) : myRecords.length ? (
            myRecords.map((record) => (
              <MyRecordCard
                key={record.id}
                record={record}
                elderName={elderNameById(record.elderId)}
                opportunityTitle={opportunityTitleById(record.relatedOpportunityId)}
              />
            ))
          ) : (
            <EmptyState
              title="暂无你的服务记录"
              note="完成服务后，可用一分钟记录本次陪伴。"
            />
          )}
        </div>
      </SectionCard>
    </div>
  );
}

export default MyServicePage;
