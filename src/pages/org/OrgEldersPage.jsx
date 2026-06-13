import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import ArchiveElderDialog from "../../components/ArchiveElderDialog";
import EmptyState from "../../components/EmptyState";
import { useAuthData } from "../../hooks/useAuthData.jsx";
import { useElderData } from "../../hooks/useElderData";
import { buildElderPreview } from "../../services/storageService";
import { formatAge } from "../../utils/age";
import { formatDateTime } from "../../utils/date";

function OrgEldersPage() {
  const { elders, archiveElder, restoreElder, loading, error, saveError } = useElderData();
  const [activeFilter, setActiveFilter] = useState("active");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [notice, setNotice] = useState("");
  const { canManageElders: canManage, canEditElders: canEdit } = useAuthData();
  const filteredElders = useMemo(
    () =>
      elders.filter((elder) =>
        activeFilter === "archived"
          ? elder.status === "archived"
          : elder.status !== "archived"
      ),
    [activeFilter, elders]
  );
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
    <section className="panel">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="section-title">长者档案</h2>
          <p className="section-note mt-1">当前显示 {filteredElders.length} 位长者。</p>
        </div>
        {canEdit ? (
          <Link to="/elders/new" className="primary-btn">
            新增长者
          </Link>
        ) : null}
      </div>

      <div className="mb-4 flex gap-2">
        {[
          { label: "在册", value: "active" },
          { label: "已归档", value: "archived" },
        ].map((filter) => {
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

      {notice ? (
        <p className="mb-4 rounded-[22px] bg-app-green px-4 py-3 text-base font-bold text-app-ink">
          {notice}
        </p>
      ) : null}

      {loading ? (
        <p className="mb-4 rounded-[22px] bg-app-cream px-4 py-3 text-base font-bold text-app-ink">
          正在读取长者档案...
        </p>
      ) : null}

      {error || saveError ? (
        <p className="mb-4 rounded-[22px] bg-app-orangeSoft px-4 py-3 text-base font-bold text-app-orange">
          {error || saveError}
        </p>
      ) : null}

      <div className="hidden overflow-hidden rounded-[24px] border border-app-line bg-app-white lg:block">
        {filteredElders.length ? filteredElders.map((elder) => (
          <div key={elder.id} className="grid grid-cols-[1.2fr_1fr_2fr_auto] items-center gap-4 border-b border-app-line p-4 last:border-b-0">
            <div className="flex items-center gap-3">
              <img src={elder.avatar} alt={elder.name} className="h-12 w-12 rounded-2xl object-cover" />
              <div>
                <p className="text-base font-extrabold">{elder.name}</p>
                <p className="text-sm font-bold text-app-muted">{formatAge(elder.birthDate)} · {elder.gender}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilter === "archived" ? (
                <>
                  <span className="pill bg-app-orangeSoft text-app-orange">
                    {elder.archivedReason || "未填写原因"}
                  </span>
                  <span className="text-xs font-bold text-app-muted">
                    {elder.archivedAt ? formatDateTime(elder.archivedAt) : ""}
                  </span>
                </>
              ) : (
                elder.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="pill bg-app-green text-app-ink">#{tag}</span>
                ))
              )}
            </div>
            <p className="text-sm font-medium leading-6 text-app-ink/80">{elder.summary}</p>
            <div className="flex gap-2">
              <Link to={`/elders/${elder.id}`} state={getDetailState(elder)} className="secondary-btn">
                查看档案
              </Link>
              {canEdit && activeFilter === "active" ? (
                <Link to={`/elders/${elder.id}/edit`} className="secondary-btn">
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
        )) : (
          <div className="p-4">
            <EmptyState
              title={activeFilter === "archived" ? "暂无已归档长者" : "暂无长者档案"}
              note={
                activeFilter === "archived"
                  ? "归档后的长者会显示在这里，历史服务记录仍会保留。"
                  : "点击“新增长者”，开始建立第一张知老卡。"
              }
            />
          </div>
        )}
      </div>

      <div className="space-y-3 lg:hidden">
        {filteredElders.length ? filteredElders.map((elder) => (
          <article key={elder.id} className="rounded-[26px] bg-app-white p-4 shadow-sm">
            <div className="flex gap-3">
              <img src={elder.avatar} alt={elder.name} className="h-14 w-14 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-extrabold">{elder.name}</h3>
                <p className="mt-1 text-sm font-bold text-app-muted">{formatAge(elder.birthDate)} · {elder.gender}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilter === "archived" ? (
                <span className="pill bg-app-orangeSoft text-app-orange">
                  归档原因：{elder.archivedReason || "未填写"}
                </span>
              ) : (
                elder.tags?.slice(0, 4).map((tag) => (
                  <span key={tag} className="pill bg-app-green text-app-ink">#{tag}</span>
                ))
              )}
            </div>
            {activeFilter === "archived" && elder.archivedAt ? (
              <p className="mt-3 text-sm font-bold text-app-muted">
                归档时间：{formatDateTime(elder.archivedAt)}
              </p>
            ) : null}
            <p className="mt-3 text-base leading-7 text-app-ink/85">{elder.summary}</p>
            <Link to={`/elders/${elder.id}`} state={getDetailState(elder)} className="secondary-btn mt-4 w-full">
              查看档案
            </Link>
            {canEdit && activeFilter === "active" ? (
              <Link to={`/elders/${elder.id}/edit`} className="secondary-btn mt-3 w-full">
                编辑
              </Link>
            ) : null}
            {canManage && activeFilter === "archived" ? (
              <button type="button" onClick={() => handleRestore(elder)} className="secondary-btn mt-3 w-full">
                恢复
              </button>
            ) : null}
          </article>
        )) : (
          <EmptyState
            title={activeFilter === "archived" ? "暂无已归档长者" : "暂无长者档案"}
            note={
              activeFilter === "archived"
                ? "归档后的长者会显示在这里，历史服务记录仍会保留。"
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
    </section>
  );
}

export default OrgEldersPage;
