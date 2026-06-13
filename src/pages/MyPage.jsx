import {
  Building2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  HeartHandshake,
  Info,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SectionCard from "../components/SectionCard";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useOrganizationData } from "../hooks/useOrganizationData";
import { useServiceData } from "../hooks/useServiceData";
import { exportLocalBackup, importLocalBackupFile } from "../services/backupService";
import { formatDurationTotal, sumDurationHours } from "../utils/serviceDuration";

function emailPrefix(email = "") {
  return String(email).split("@")[0] || "";
}

function isCurrentUserRecord(record, user) {
  if (!user?.id) return false;
  if (record.operatorId === user.id) return true;
  if (record.operatorId) return false;

  const candidates = [user?.name, user?.email, emailPrefix(user?.email)].filter(Boolean);
  return candidates.includes(record.operatorName);
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[20px] bg-app-cream px-4 py-3">
      <span className="shrink-0 text-sm font-bold text-app-muted">{label}</span>
      <span className="min-w-0 break-words text-right text-base font-extrabold leading-7 text-app-ink">
        {value || "未填写"}
      </span>
    </div>
  );
}

function SettingsListItem({ to, icon: Icon, label, note }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-[24px] bg-app-white px-4 py-4 shadow-sm active:scale-[0.99]"
    >
      <span className="flex min-w-0 items-center gap-3 text-base font-extrabold text-app-ink">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-app-orangeSoft text-app-orange">
          <Icon size={20} />
        </span>
        <span className="min-w-0">
          <span className="block break-words">{label}</span>
          {note ? (
            <span className="mt-1 block break-words text-sm font-bold leading-6 text-app-muted">
              {note}
            </span>
          ) : null}
        </span>
      </span>
      <ChevronRight size={20} className="shrink-0 text-app-muted" />
    </Link>
  );
}

function DurationStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] bg-app-cream px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-app-white text-app-orange">
          <Icon size={20} />
        </span>
        <div>
          <p className="text-sm font-bold text-app-muted">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-app-ink">{value}</p>
        </div>
      </div>
    </div>
  );
}

function membershipStatusText(status) {
  if (status === "active") return "已加入";
  if (status === "pending") return "待加入";
  if (status === "removed") return "已移除";
  return "尚未加入机构";
}

function MyPage() {
  const {
    user,
    membership,
    canEditOrganizationSettings: canEdit,
    canManageMembers,
    usingSupabaseAuth,
    isAuthenticated,
    hasActiveMembership,
    signOut,
    error: authError,
  } = useAuthData();
  const { organization, loading, refreshing, initialLoading, error, usingSupabase } = useOrganizationData();
  const { records } = useServiceData();
  const importInputRef = useRef(null);
  const [backupNotice, setBackupNotice] = useState("");
  const [backupError, setBackupError] = useState("");
  const role = membership?.role || "";
  const canShowServiceStats = !usingSupabaseAuth || (isAuthenticated && hasActiveMembership);
  const canViewOrgReport =
    canShowServiceStats && (canEdit || role === "staff" || role === "platform_admin");
  const myRecords = canShowServiceStats
    ? records.filter((record) => isCurrentUserRecord(record, user))
    : [];
  const totalDuration = sumDurationHours(myRecords);
  const confirmedDuration = sumDurationHours(myRecords, "confirmed");
  const pendingDuration = sumDurationHours(myRecords, "pending");

  const handleExportBackup = () => {
    exportLocalBackup();
    setBackupNotice("本地数据备份已导出。");
    setBackupError("");
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!window.confirm("导入后将覆盖当前本地数据，是否继续？")) return;

    try {
      await importLocalBackupFile(file);
      setBackupNotice("数据已导入。");
      setBackupError("");
      window.setTimeout(() => window.location.reload(), 500);
    } catch (nextError) {
      setBackupNotice("");
      setBackupError(nextError.message || "导入失败，请检查备份文件。");
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-app-orange text-white">
            <UserRound size={30} />
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-extrabold text-app-ink">
              {user?.name || "未登录"}
            </h1>
            <p className="mt-2 text-lg font-extrabold text-app-orange">
              {membership?.roleName || (usingSupabaseAuth ? "尚未加入机构" : "服务人员")}
            </p>
            <p className="mt-1 break-words text-base font-bold text-app-muted">
              当前机构：{organization?.name || "未填写"}
            </p>
            {usingSupabaseAuth ? (
              <>
                <p className="mt-1 break-words text-sm font-bold text-app-muted">
                  当前邮箱：{user?.email || membership?.email || "未填写"}
                </p>
                <p className="mt-1 break-words text-sm font-bold text-app-muted">
                  成员状态：{membershipStatusText(membership?.status)}
                </p>
              </>
            ) : null}
          </div>
        </div>

        {usingSupabaseAuth ? (
          <div className="mt-5 grid grid-cols-1 gap-3">
            {isAuthenticated ? (
              <button type="button" onClick={signOut} className="secondary-btn w-full">
                退出登录
              </button>
            ) : (
              <Link to="/auth" className="primary-btn w-full">
                登录 / 注册
              </Link>
            )}
            {authError ? (
              <p className="rounded-[20px] bg-app-orangeSoft px-4 py-3 text-base font-bold leading-7 text-app-orange">
                {authError}
              </p>
            ) : null}
            {isAuthenticated && !hasActiveMembership ? (
              <p className="rounded-[20px] bg-app-orangeSoft px-4 py-3 text-base font-bold leading-7 text-app-orange">
                {membership?.status === "removed"
                  ? "你已不再是当前机构成员，请联系机构管理员。"
                  : "尚未加入机构，请联系机构管理员添加成员身份。"}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {canShowServiceStats ? (
        <SectionCard title="我的服务时长" note="服务时长用于志愿服务记录和机构统计，不作为薪酬或劳务结算依据。">
          <div className="grid gap-3 sm:grid-cols-2">
            <DurationStat icon={Clock3} label="累计服务时长" value={formatDurationTotal(totalDuration)} />
            <DurationStat icon={ShieldCheck} label="已确认服务时长" value={formatDurationTotal(confirmedDuration)} />
            <DurationStat icon={Clock3} label="待确认服务时长" value={formatDurationTotal(pendingDuration)} />
            <DurationStat icon={ClipboardList} label="服务记录次数" value={myRecords.length} />
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="机构空间"
        note={usingSupabase ? "当前机构信息来自 Supabase organizations 表。" : "当前试点机构的基础信息。"}
        action={
          canEdit ? (
            <Link to="/my/organization-settings" className="secondary-btn">
              机构设置
            </Link>
          ) : null
        }
      >
        <div className="space-y-3">
          {initialLoading ? (
            <p className="rounded-[20px] bg-app-cream px-4 py-3 text-base font-bold leading-7 text-app-ink">
              正在读取机构信息...
            </p>
          ) : null}
          {refreshing ? (
            <p className="rounded-[20px] bg-app-blue px-4 py-3 text-sm font-bold leading-6 text-app-ink">
              正在同步机构信息...
            </p>
          ) : null}
          {error ? (
            <p className="rounded-[20px] bg-app-orangeSoft px-4 py-3 text-base font-bold leading-7 text-app-orange">
              {error}
            </p>
          ) : null}
          <InfoRow label="机构名称" value={organization?.name} />
          <InfoRow label="机构类型" value={organization?.type} />
          <InfoRow label="所在城市" value={organization?.city} />
          <InfoRow label="联系人" value={organization?.contactName} />
          <InfoRow label="联系电话" value={organization?.contactPhone} />
          <InfoRow label="机构说明" value={organization?.description} />
          {canViewOrgReport ? (
            <SettingsListItem
              to="/org/report"
              icon={FileText}
              label="机构成果简报"
              note="查看本月服务成果与累计服务沉淀"
            />
          ) : null}
          {canEdit ? null : (
            <p className="rounded-[20px] bg-app-blue px-4 py-3 text-base font-bold leading-7 text-app-ink">
              仅机构管理员可修改机构信息。
            </p>
          )}
        </div>
      </SectionCard>

      {canEdit ? (
        <SectionCard
          title="数据备份"
          note="当前试点版本的本地数据仍可导出备份，建议定期保留备份文件。"
        >
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full rounded-[24px] bg-app-orange px-5 py-4 text-lg font-extrabold text-white shadow-sm active:scale-[0.99]"
            >
              导出本地数据备份
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="w-full rounded-[24px] bg-app-cream px-5 py-4 text-lg font-extrabold text-app-ink active:scale-[0.99]"
            >
              导入本地数据备份
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportBackup}
              className="hidden"
            />
            {backupNotice ? (
              <p className="rounded-[20px] bg-app-green px-4 py-3 text-base font-bold leading-7 text-app-ink">
                {backupNotice}
              </p>
            ) : null}
            {backupError ? (
              <p className="rounded-[20px] bg-app-orangeSoft px-4 py-3 text-base font-bold leading-7 text-app-orange">
                {backupError}
              </p>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      <section className="space-y-3">
        <h2 className="px-1 text-xl font-extrabold text-app-ink">功能</h2>
        <SettingsListItem
          to="/my-service"
          icon={HeartHandshake}
          label="我的服务"
          note="查看我负责的服务提醒和我的服务记录。"
        />
        <SettingsListItem to="/my/privacy" icon={ShieldCheck} label="隐私与使用边界" />
        {canManageMembers ? (
          <SettingsListItem to="/members" icon={UsersRound} label="成员管理" />
        ) : null}
        <SettingsListItem to="/my/about" icon={Info} label="关于知老" />
      </section>

      <section className="rounded-[28px] bg-app-green p-5">
        <div className="flex items-center gap-3">
          <Building2 size={24} className="text-app-ink" />
          <p className="text-base font-bold leading-7 text-app-ink">
            机构空间用于承载长者档案、服务机会和服务记录。
          </p>
        </div>
      </section>
    </div>
  );
}

export default MyPage;
