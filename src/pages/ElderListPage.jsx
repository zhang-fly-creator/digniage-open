import { Edit3 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArchiveElderDialog from "../components/ArchiveElderDialog";
import ElderCard from "../components/ElderCard";
import EmptyState from "../components/EmptyState";
import SectionCard from "../components/SectionCard";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useElderData } from "../hooks/useElderData";
import { buildElderPreview } from "../services/storageService";
import { formatAge } from "../utils/age";
import { formatDateTime } from "../utils/date";

const filters = [
  { label: "在册", value: "active" },
  { label: "已归档", value: "archived" },
];

function ElderListPage() {
  const { elders, archiveElder, restoreElder, loading, refreshing, initialLoading, error, saveError } = useElderData();
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState("active");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [notice, setNotice] = useState("");
  const { canManageElders: canManage, canEditElders: canEdit } = useAuthData();

  const filteredElders = useMemo(() => {
    const byStatus = elders.filter((elder) =>
      activeFilter === "archived"
        ? elder.status === "archived"
        : elder.status !== "archived"
    );
    const value = keyword.trim();
    if (!value) return byStatus;
    return byStatus.filter((elder) => elder.name.includes(value));
  }, [activeFilter, elders, keyword]);
  const hasActiveElders = elders.some((elder) => elder.status !== "archived");
  const getDetailState = (elder) => ({ elderPreview: buildElderPreview(elder) });

  const openArchiveDialog = (elder) => {
    if (!canManage) {
      setNotice("你当前没有权限，请联系机构管理员。");
      return;
    }
    setArchiveTarget(elder);
    setArchiveReason("");
    setNotice("");
  };

  const confirmArchive = async () => {
    if (!archiveTarget || !archiveReason) return;
    try {
      await archiveElder(archiveTarget.id, archiveReason);
      setArchiveTarget(null);
      setArchiveReason("");
      setNotice("长者档案已归档。");
    } catch {
      setNotice("");
    }
  };

  const handleRestore = async (elder) => {
    if (!canManage) {
      setNotice("你当前没有权限，请联系机构管理员。");
      return;
    }
    try {
      await restoreElder(elder.id);
      setNotice("长者档案已恢复。");
    } catch {
      setNotice("");
    }
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="长者档案"
        note="人工填写事实，AI 生成方法，人工确认保存。"
        action={
          canEdit ? (
            <Link to="/elders/new" className="primary-btn">
              新增长者
            </Link>
          ) : null
        }
      >
        <div className="grid gap-3">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索长者姓名"
          />
          <div className="grid grid-cols-2 gap-2">
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
        </div>
      </SectionCard>

      {notice ? (
        <section className="rounded-[24px] bg-app-green p-4 text-base font-bold leading-7 text-app-ink">
          {notice}
        </section>
      ) : null}

      {initialLoading ? (
        <section className="rounded-[24px] bg-app-cream p-4 text-base font-bold leading-7 text-app-ink">
          正在读取长者档案...
        </section>
      ) : null}

      {refreshing ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步长者档案...
        </section>
      ) : null}
      {error || saveError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {error || saveError}
        </section>
      ) : null}

      <div className="hidden">
        {filteredElders.length ? (
          filteredElders.map((elder) => (
            <div
              key={elder.id}
              className="grid grid-cols-[1.1fr_1fr_2fr_1fr_auto] items-center gap-4 border-b border-app-line p-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <img
                  src={elder.avatar}
                  alt={elder.name}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div>
                  <p className="text-base font-extrabold">{elder.name}</p>
                  <p className="mt-1 text-sm font-bold text-app-muted">
                    {formatAge(elder.birthDate)} · {elder.gender}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilter === "archived" ? (
                  <span className="pill bg-app-orangeSoft text-app-orange">
                    {elder.archivedReason || "未填写原因"}
                  </span>
                ) : (
                  elder.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="pill bg-app-green text-app-ink">
                      #{tag}
                    </span>
                  ))
                )}
              </div>
              <p className="text-sm font-medium leading-6 text-app-ink/80">
                {elder.summary || "待补充知老卡简介。"}
              </p>
              <p className="text-sm font-bold text-app-muted">
                {activeFilter === "archived" && elder.archivedAt
                  ? formatDateTime(elder.archivedAt)
                  : formatDateTime(elder.updatedAt)}
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <Link to={`/elders/${elder.id}`} state={getDetailState(elder)} className="secondary-btn">
                  查看档案
                </Link>
                {canEdit ? (
                  <Link to={`/elders/${elder.id}/edit`} className="secondary-btn">
                    <Edit3 size={16} />
                    编辑
                  </Link>
                ) : null}
                {canManage && activeFilter === "active" ? (
                  <button type="button" onClick={() => openArchiveDialog(elder)} className="secondary-btn">
                    归档
                  </button>
                ) : null}
                {canManage && activeFilter === "archived" ? (
                  <button type="button" onClick={() => handleRestore(elder)} className="secondary-btn">
                    恢复
                  </button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4">
            <EmptyState
              title={
                activeFilter === "archived"
                  ? "暂无已归档长者"
                  : hasActiveElders
                    ? "没有找到匹配的长者"
                    : "暂无长者档案"
              }
              note={
                activeFilter === "archived"
                  ? "归档后的长者会显示在这里，历史服务记录仍会保留。"
                  : hasActiveElders
                    ? "试试输入完整姓名，或者清空搜索条件。"
                    : "点击“新增长者”，开始建立第一张知老卡。"
              }
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredElders.length ? (
          filteredElders.map((elder) => (
            <ElderCard
              key={elder.id}
              elder={elder}
              canManage={canManage}
              canEdit={canEdit}
              archived={activeFilter === "archived"}
              onArchive={openArchiveDialog}
              onRestore={handleRestore}
            />
          ))
        ) : (
          <EmptyState
            title={
              activeFilter === "archived"
                ? "暂无已归档长者"
                : hasActiveElders
                  ? "没有找到匹配的长者"
                  : "暂无长者档案"
            }
            note={
              activeFilter === "archived"
                ? "归档后的长者会显示在这里，历史服务记录仍会保留。"
                : hasActiveElders
                  ? "试试输入完整姓名，或者清空搜索条件。"
                  : "点击“新增长者”，开始建立第一张知老卡。"
            }
          />
        )}
      </div>

      {archiveTarget ? (
        <ArchiveElderDialog
          elderName={archiveTarget.name}
          reason={archiveReason}
          onReasonChange={setArchiveReason}
          onCancel={() => setArchiveTarget(null)}
          onConfirm={confirmArchive}
        />
      ) : null}
    </div>
  );
}

export default ElderListPage;
