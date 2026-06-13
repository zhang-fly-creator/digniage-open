import { CalendarHeart, ClipboardList, HeartHandshake, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import { useAuthData } from "../../hooks/useAuthData.jsx";
import { useNewsData } from "../../hooks/useNewsData";
import { useServiceData } from "../../hooks/useServiceData";
import { formatAge } from "../../utils/age";
import { formatDateTime } from "../../utils/date";
import { newsScopeLabel } from "../NewsListPage";

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <article className={`rounded-[28px] ${tone} p-5 shadow-sm`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-app-muted">{label}</p>
        <Icon size={24} />
      </div>
      <p className="mt-4 text-3xl font-extrabold text-app-ink">{value}</p>
    </article>
  );
}

function countCurrentMonthRecords(records) {
  const today = new Date();
  return records.filter((record) => {
    const value = new Date(record.createdAt);
    return value.getFullYear() === today.getFullYear() && value.getMonth() === today.getMonth();
  }).length;
}

function OrgHomePage() {
  const { elders, opportunities, records, loading, refreshing, initialLoading, error, readErrors } = useServiceData();
  const { canCreateServiceOpportunities, isVolunteer, user } = useAuthData();
  const { posts: newsPosts, loading: newsLoading, refreshing: newsRefreshing, initialLoading: newsInitialLoading } = useNewsData();
  const activeElders = elders.filter((elder) => elder.status !== "archived");
  const activeElderIds = new Set(activeElders.map((elder) => elder.id));
  const pendingOpportunities = opportunities.filter(
    (item) =>
      item.status === "pending" &&
      activeElderIds.has(item.elderId) &&
      (!isVolunteer || item.assignedToUserId === user?.id)
  );
  const focusElder = activeElders[0];
  const recentRecords = records.slice(0, 3);
  const homeNews = newsPosts.filter((post) => post.scope === "organization").slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="在册长者"
          value={initialLoading ? "..." : activeElders.length}
          tone="bg-app-white"
        />
        <StatCard
          icon={HeartHandshake}
          label="待处理机会"
          value={initialLoading ? "..." : pendingOpportunities.length}
          tone="bg-app-orangeSoft"
        />
        <StatCard
          icon={ClipboardList}
          label="本月服务记录"
          value={initialLoading ? "..." : countCurrentMonthRecords(records)}
          tone="bg-app-green"
        />
      </section>

      {refreshing || newsRefreshing ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步工作台数据...
        </section>
      ) : null}

      {readErrors.elders || readErrors.opportunities || readErrors.records ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {readErrors.elders || readErrors.opportunities || readErrors.records}
        </section>
      ) : null}

      {canCreateServiceOpportunities ? (
        <section className="panel">
          <Link
            to="/org/opportunities/new"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[22px] bg-app-orange px-5 py-3 text-base font-extrabold text-white active:scale-[0.99]"
          >
            <Plus size={20} />
            新增服务提醒
          </Link>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="panel">
          <h2 className="section-title">今日重点长者</h2>
          {focusElder ? (
            <div className="mt-4 flex items-start gap-4">
              <img
                src={focusElder.avatarUrl || focusElder.avatarDataUrl || focusElder.avatar}
                alt={focusElder.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div>
                <h3 className="text-xl font-extrabold">{focusElder.name}</h3>
                <p className="mt-1 text-sm font-bold text-app-muted">
                  {formatAge(focusElder.birthDate)} · {focusElder.gender || "未填写"}
                </p>
                <p className="mt-3 text-base leading-7 text-app-ink/85">{focusElder.summary}</p>
                <Link to={`/elders/${focusElder.id}`} className="secondary-btn mt-4">
                  查看档案
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm font-bold text-app-muted">暂无在册长者。</p>
          )}
        </article>

        <article className="panel">
          <h2 className="section-title">今日服务机会</h2>
          <div className="mt-4 space-y-3">
            {pendingOpportunities.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to={`/opportunities/${item.id}`}
                className="flex items-start gap-3 rounded-[22px] bg-app-cream p-4"
              >
                <CalendarHeart className="mt-1 shrink-0 text-app-orange" size={22} />
                <div>
                  <p className="text-sm font-bold text-app-muted">{item.type}</p>
                  <p className="mt-1 text-base font-extrabold leading-7 text-app-ink">{item.title}</p>
                </div>
              </Link>
            ))}
            {!pendingOpportunities.length ? (
              <p className="text-sm font-bold text-app-muted">
                {isVolunteer ? "暂无分配给你的服务机会。" : "暂无待处理服务机会。"}
              </p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="panel">
        <h2 className="section-title">最近服务记录</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {recentRecords.map((record) => {
            const elderName = elders.find((elder) => elder.id === record.elderId)?.name || "未匹配长者";
            return (
              <article key={record.id} className="rounded-[22px] bg-app-white p-4 shadow-sm">
                <p className="text-base font-extrabold text-app-ink">
                  {record.operatorName || "未填写"} 服务了 {elderName}
                </p>
                <p className="mt-2 text-sm font-bold text-app-muted">{formatDateTime(record.createdAt)}</p>
                <p className="mt-3 text-base leading-7 text-app-ink/85">{record.content}</p>
              </article>
            );
          })}
          {!recentRecords.length ? (
            <p className="text-sm font-bold text-app-muted">暂无服务记录。</p>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-title">机构动态</h2>
          <Link to="/news" className="secondary-btn">
            查看更多
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {newsInitialLoading ? (
            <EmptyState title="正在加载动态" note="请稍候。" />
          ) : homeNews.length ? (
            homeNews.map((post) => (
              <Link key={post.id} to={`/news/${post.id}`} className="rounded-[22px] bg-app-cream p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-app-blue px-3 py-1.5 text-xs font-extrabold text-app-ink">
                    {newsScopeLabel(post.scope)}
                  </span>
                  <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-xs font-extrabold text-app-orange">
                    {post.category || "动态"}
                  </span>
                </div>
                <p className="mt-3 text-base font-extrabold leading-7 text-app-ink">{post.title}</p>
                <p className="mt-2 text-sm leading-6 text-app-ink/80">
                  {post.summary || post.content.slice(0, 60)}
                </p>
              </Link>
            ))
          ) : (
            <EmptyState title="暂无机构动态" note="发布后会显示在这里。" />
          )}
        </div>
      </section>
    </div>
  );
}

export default OrgHomePage;
