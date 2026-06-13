import { BarChart3, Clock3, FileText, HeartHandshake, UsersRound } from "lucide-react";
import { useState } from "react";
import EmptyState from "../../components/EmptyState";
import { useServiceData } from "../../hooks/useServiceData";
import { formatDurationTotal, sumDurationHours } from "../../utils/serviceDuration";

const reportTabs = [
  { key: "monthly", label: "本月简报" },
  { key: "total", label: "累计总览" },
];

function isCurrentMonth(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-[24px] bg-app-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
          <Icon size={22} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-app-muted">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-app-ink">{value}</p>
        </div>
      </div>
    </article>
  );
}

function OrgReportPage() {
  const { elders, opportunities, records, initialLoading, refreshing, readErrors, error } =
    useServiceData();
  const [activeTab, setActiveTab] = useState("monthly");

  const monthlyRecords = records.filter((record) => isCurrentMonth(record.createdAt));
  const monthlyCompletedOpportunities = opportunities.filter(
    (opportunity) => opportunity.status === "completed" && isCurrentMonth(opportunity.completedAt)
  );
  const pendingOpportunities = opportunities.filter((opportunity) => opportunity.status === "pending");
  const monthlyServedElders = new Set(
    monthlyRecords.map((record) => record.elderId).filter(Boolean)
  ).size;

  const monthlyItems = [
    {
      label: "服务老人",
      value: initialLoading ? "..." : String(monthlyServedElders),
      icon: UsersRound,
    },
    {
      label: "服务记录",
      value: initialLoading ? "..." : String(monthlyRecords.length),
      icon: FileText,
    },
    {
      label: "服务时长",
      value: initialLoading ? "..." : formatDurationTotal(sumDurationHours(monthlyRecords)),
      icon: Clock3,
    },
    {
      label: "完成机会",
      value: initialLoading ? "..." : String(monthlyCompletedOpportunities.length),
      icon: HeartHandshake,
    },
    {
      label: "待跟进事项",
      value: initialLoading ? "..." : String(pendingOpportunities.length),
      icon: BarChart3,
    },
  ];

  const totalItems = [
    {
      label: "累计知老卡",
      value: initialLoading ? "..." : String(elders.length),
      icon: UsersRound,
    },
    {
      label: "累计服务记录",
      value: initialLoading ? "..." : String(records.length),
      icon: FileText,
    },
    {
      label: "累计服务时长",
      value: initialLoading ? "..." : formatDurationTotal(sumDurationHours(records)),
      icon: Clock3,
    },
    {
      label: "累计完成机会",
      value: initialLoading
        ? "..."
        : String(opportunities.filter((opportunity) => opportunity.status === "completed").length),
      icon: HeartHandshake,
    },
  ];

  const activeItems = activeTab === "monthly" ? monthlyItems : totalItems;
  const readMessage =
    readErrors.elders || readErrors.opportunities || readErrors.records || error || "";
  const hasAnyReportData = elders.length > 0 || opportunities.length > 0 || records.length > 0;

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-app-orange text-white">
            <BarChart3 size={28} />
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-extrabold text-app-ink">机构成果简报</h1>
            <p className="mt-2 text-base font-medium leading-7 text-app-muted">
              用于查看机构本月服务成果与累计服务沉淀
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-app-white p-4 shadow-card">
        <div className="grid grid-cols-2 gap-3">
          {reportTabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-[22px] px-4 py-3 text-base font-extrabold active:scale-[0.99] ${
                  active ? "bg-app-orange text-white" : "bg-app-cream text-app-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {refreshing ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步机构成果数据...
        </section>
      ) : null}

      {readMessage ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {readMessage}
        </section>
      ) : null}

      {initialLoading ? (
        <EmptyState title="正在准备机构成果简报" note="请稍候。" />
      ) : hasAnyReportData ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {activeItems.map((item) => (
            <MetricCard key={item.label} icon={item.icon} label={item.label} value={item.value} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="暂无机构成果数据"
          note="先建立知老卡、补充服务机会或完成一次服务记录，这里会逐步形成可复盘的机构成果。"
        />
      )}

      <section className="rounded-[28px] bg-app-green p-5">
        <p className="text-base font-bold leading-7 text-app-ink">
          机构成果简报将根据知老卡、服务机会和服务记录自动生成，用于机构内部复盘与公益服务成果沉淀。
        </p>
        <p className="mt-2 text-sm font-bold leading-6 text-app-ink/80">
          体验阶段请使用模拟或脱敏信息。AI内容仅用于服务辅助，需人工确认后使用。
        </p>
      </section>
    </div>
  );
}

export default OrgReportPage;
