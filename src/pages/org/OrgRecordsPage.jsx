import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import { useAuthData } from "../../hooks/useAuthData.jsx";
import { useServiceData } from "../../hooks/useServiceData";
import { formatDateTime } from "../../utils/date";
import {
  durationStatusLabel,
  formatDurationHours,
  formatDurationTotal,
  normalizeDurationStatus,
  sumDurationHours,
} from "../../utils/serviceDuration";

function isCurrentMonth(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[22px] bg-app-cream px-4 py-3">
      <p className="text-sm font-bold text-app-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-app-ink">{value}</p>
    </div>
  );
}

function OrgRecordsPage() {
  const { elders, opportunities, records, refreshing, initialLoading, readErrors } = useServiceData();
  const { canCreateServiceRecords } = useAuthData();
  const [showRefreshingBanner, setShowRefreshingBanner] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState("");
  const monthlyRecords = records.filter((record) => isCurrentMonth(record.createdAt));
  const confirmedRecords = records.filter(
    (record) => normalizeDurationStatus(record.durationStatus) === "confirmed"
  );
  const pendingRecords = records.filter(
    (record) => normalizeDurationStatus(record.durationStatus) === "pending"
  );
  const participantCount = new Set(
    records
      .map((record) => record.operatorId || record.operatorName)
      .filter(Boolean)
  ).size;

  const elderName = (elderId) =>
    elders.find((elder) => elder.id === elderId)?.name || "未匹配长者";
  const opportunityTitle = (opportunityId) =>
    opportunities.find((item) => item.id === opportunityId)?.title || "手动记录";

  useEffect(() => {
    if (!refreshing) {
      setShowRefreshingBanner(false);
      return undefined;
    }

    setShowRefreshingBanner(true);
    setRefreshNotice("");

    const timeout = window.setTimeout(() => {
      setShowRefreshingBanner(false);
      if (records.length > 0) {
        setRefreshNotice("后台同步暂未完成，已显示现有服务记录。");
      }
    }, 8000);

    return () => window.clearTimeout(timeout);
  }, [records.length, refreshing]);

  return (
    <section className="panel">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="section-title">服务记录</h2>
          <p className="section-note mt-1">共 {records.length} 条服务记录。</p>
        </div>
        {canCreateServiceRecords ? (
          <Link to="/records?mode=new" className="primary-btn">
            新增记录
          </Link>
        ) : null}
      </div>

      {readErrors.records ? (
        <section className="mb-4 rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {readErrors.records}
        </section>
      ) : null}

      {showRefreshingBanner ? (
        <section className="mb-4 rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步服务记录...
        </section>
      ) : null}

      {refreshNotice ? (
        <section className="mb-4 rounded-[24px] bg-app-orangeSoft p-4 text-sm font-bold leading-6 text-app-orange">
          {refreshNotice}
        </section>
      ) : null}

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <StatCard label="本月服务总时长" value={formatDurationTotal(sumDurationHours(monthlyRecords))} />
        <StatCard label="已确认服务时长" value={formatDurationTotal(sumDurationHours(confirmedRecords))} />
        <StatCard label="待确认记录数" value={pendingRecords.length} />
        <StatCard label="参与服务人员数" value={participantCount} />
      </div>

      <div className="hidden overflow-hidden rounded-[24px] border border-app-line bg-app-white lg:block">
        {initialLoading ? (
          <div className="p-4">
            <EmptyState title="正在加载服务记录" note="请稍候。" />
          </div>
        ) : records.length ? records.map((record) => (
          <div key={record.id} className="grid grid-cols-[1fr_1fr_2fr_1fr] gap-4 border-b border-app-line p-4 last:border-b-0">
            <div>
              <p className="text-base font-extrabold">{elderName(record.elderId)}</p>
              <p className="mt-1 text-sm font-bold text-app-muted">{record.operatorName || "未填写"}</p>
            </div>
            <div>
              <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-xs font-extrabold text-app-ink">
                {record.serviceType}
              </span>
              <p className="mt-2 text-sm font-bold text-app-muted">{record.elderStatus}</p>
              <p className="mt-2 text-sm font-bold text-app-muted">
                服务时长：{formatDurationHours(record.durationHours)}
              </p>
              <p className="mt-1 text-xs font-bold text-app-muted">
                {durationStatusLabel(record.durationStatus)}
              </p>
            </div>
            <p className="text-sm font-medium leading-6 text-app-ink/80">{record.content}</p>
            <div>
              <p className="text-sm font-bold text-app-muted">{formatDateTime(record.createdAt)}</p>
              <p className="mt-2 text-xs font-bold leading-5 text-app-muted">
                {opportunityTitle(record.relatedOpportunityId)}
              </p>
            </div>
          </div>
        )) : (
          <div className="p-4">
            <EmptyState
              title="暂无服务记录"
              note="每一次陪伴后，都可以用一分钟记录本次服务。"
            />
          </div>
        )}
      </div>

      <div className="space-y-3 lg:hidden">
        {initialLoading ? (
          <EmptyState title="正在加载服务记录" note="请稍候。" />
        ) : records.length ? records.map((record) => (
          <article key={record.id} className="rounded-[28px] bg-app-white p-5 shadow-sm">
            <p className="text-lg font-extrabold">
              {(record.operatorName || "未填写")} 服务了 {elderName(record.elderId)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-app-orangeSoft px-3 py-1.5 text-sm font-bold text-app-ink">
                {record.serviceType}
              </span>
              <span className="rounded-full bg-app-green px-3 py-1.5 text-sm font-bold text-app-ink">
                {record.elderStatus}
              </span>
              <span className="rounded-full bg-app-blue px-3 py-1.5 text-sm font-bold text-app-ink">
                服务时长：{formatDurationHours(record.durationHours)}
              </span>
              <span className="rounded-full bg-app-cream px-3 py-1.5 text-sm font-bold text-app-muted">
                {durationStatusLabel(record.durationStatus)}
              </span>
            </div>
            <p className="mt-3 text-base leading-7 text-app-ink/85">{record.content}</p>
            <p className="mt-3 text-sm font-bold text-app-muted">{formatDateTime(record.createdAt)}</p>
          </article>
        )) : (
          <EmptyState
            title="暂无服务记录"
            note="每一次陪伴后，都可以用一分钟记录本次服务。"
          />
        )}
      </div>
    </section>
  );
}

export default OrgRecordsPage;
