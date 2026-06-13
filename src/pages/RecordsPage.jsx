import { CheckCircle2, Plus, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import RecordCard from "../components/RecordCard";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useServiceData } from "../hooks/useServiceData";
import { analyzeServiceRecord } from "../services/aiService";
import { nextSuggestionToText } from "../utils/nextSuggestion";
import { SERVICE_DURATION_OPTIONS } from "../utils/serviceDuration";

const serviceTypes = ["探访", "陪伴", "活动", "家属沟通", "康复回访", "其他"];
const elderStatuses = ["开心", "平稳", "低落", "需要关注"];

const emptyRecord = {
  elderId: "",
  relatedOpportunityId: "",
  serviceType: "探访",
  durationHours: 1,
  elderStatus: "平稳",
  content: "",
  newInfo: "",
  nextSuggestion: "",
  operatorName: "",
};

function TextArea(props) {
  return <textarea className="min-h-24 text-lg leading-8" {...props} />;
}

function defaultOperatorName(user) {
  return user?.name || String(user?.email || "").split("@")[0] || "";
}

function canMutateRecord(record, user, { isOrgAdmin, isStaff, isVolunteer }) {
  if (!record) return false;
  if (isOrgAdmin) return true;
  if (!record.operatorId || record.operatorId !== user?.id) return false;
  return isStaff || isVolunteer;
}

function canViewRecord(record, user, { isVolunteer, isOrgAdmin }) {
  if (!record) return false;
  if (isOrgAdmin || !isVolunteer) return true;
  return Boolean(record.operatorId && record.operatorId === user?.id);
}

function defaultDurationStatus({ isVolunteer }) {
  return isVolunteer ? "pending" : "confirmed";
}

function getGeneratedOpportunityIdentity(candidate) {
  return (
    candidate?.id ||
    `${candidate?.type || ""}__${candidate?.title || ""}__${candidate?.description || ""}`
  );
}

function RecordsPage() {
  const {
    elders,
    opportunities,
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    confirmGeneratedOpportunity,
    ignoreGeneratedOpportunity,
    refreshing,
    initialLoading,
    saveError,
    readErrors,
    usingSupabase,
  } = useServiceData();
  const {
    canCompleteOpportunities,
    canCreateServiceRecords,
    isOrgAdmin,
    isStaff,
    isVolunteer,
    user,
  } = useAuthData();

  const activeElders = useMemo(
    () => elders.filter((elder) => elder.status !== "archived"),
    [elders]
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const shouldOpenForm = searchParams.get("mode") === "new";
  const elderIdFromQuery = searchParams.get("elderId") || "";
  const opportunityIdFromQuery = searchParams.get("opportunityId") || "";
  const opportunityTitleFromQuery = searchParams.get("opportunityTitle") || "";

  const [showForm, setShowForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({
    ...emptyRecord,
    elderId: elderIdFromQuery,
    relatedOpportunityId: opportunityIdFromQuery,
    operatorName: defaultOperatorName(user),
  });
  const [errors, setErrors] = useState({});
  const [aiPreview, setAiPreview] = useState(null);
  const [savedNotice, setSavedNotice] = useState("");
  const [showRefreshingBanner, setShowRefreshingBanner] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState("");
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
  const [pendingGeneratedOpportunityKey, setPendingGeneratedOpportunityKey] = useState("");
  const [pendingGeneratedOpportunityAction, setPendingGeneratedOpportunityAction] = useState("");

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

  useEffect(() => {
    const queryOpportunity = opportunities.find((item) => item.id === opportunityIdFromQuery);
    const canOpenOpportunityRecord =
      !opportunityIdFromQuery ||
      canCompleteOpportunities ||
      queryOpportunity?.assignedToUserId === user?.id;

    if (shouldOpenForm && canCreateServiceRecords && canOpenOpportunityRecord) {
      setShowForm(true);
      setEditingRecordId("");
      setForm((previous) => ({
        ...previous,
        elderId: elderIdFromQuery,
        relatedOpportunityId: opportunityIdFromQuery,
        operatorName: previous.operatorName || defaultOperatorName(user),
      }));
    }
  }, [
    canCompleteOpportunities,
    canCreateServiceRecords,
    elderIdFromQuery,
    opportunities,
    opportunityIdFromQuery,
    shouldOpenForm,
    user?.email,
    user?.id,
    user?.name,
  ]);

  const elderName = (elderId) =>
    elders.find((elder) => elder.id === elderId)?.name || "未匹配长者";

  const selectedElder = useMemo(
    () => elders.find((elder) => elder.id === form.elderId),
    [elders, form.elderId]
  );
  const selectedOpportunity = useMemo(
    () => opportunities.find((item) => item.id === form.relatedOpportunityId),
    [opportunities, form.relatedOpportunityId]
  );
  const relatedOpportunityTitle = selectedOpportunity?.title || opportunityTitleFromQuery;
  const canCompleteSelectedOpportunity =
    !form.relatedOpportunityId ||
    canCompleteOpportunities ||
    selectedOpportunity?.assignedToUserId === user?.id;

  const visibleRecords = useMemo(
    () =>
      records.filter((record) => {
        if (canViewRecord(record, user, { isVolunteer, isOrgAdmin })) {
          return true;
        }

        if (!isVolunteer || !record.relatedOpportunityId) return false;

        const relatedOpportunity = opportunities.find(
          (item) => item.id === record.relatedOpportunityId
        );
        return relatedOpportunity?.assignedToUserId === user?.id;
      }),
    [records, user, isVolunteer, isOrgAdmin, opportunities]
  );

  const filteredRecords = useMemo(() => {
    const value = keyword.trim();
    if (!value) return visibleRecords;

    return visibleRecords.filter((record) => {
      const name = elderName(record.elderId);
      return (
        name.includes(value) ||
        record.content?.includes(value) ||
        record.newInfo?.includes(value) ||
        record.operatorName?.includes(value) ||
        record.serviceType?.includes(value)
      );
    });
  }, [keyword, visibleRecords, elders]);

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setAiPreview(null);
    setSavedNotice("");
  };

  const openForm = () => {
    if (!canCreateServiceRecords) {
      setSavedNotice("你当前没有权限，请联系机构管理员。");
      return;
    }
    if (opportunityIdFromQuery && !canCompleteSelectedOpportunity) {
      setSavedNotice("你只能处理分配给自己的服务提醒。");
      return;
    }

    setShowForm(true);
    setEditingRecordId("");
    setForm({
      ...emptyRecord,
      elderId: elderIdFromQuery,
      relatedOpportunityId: opportunityIdFromQuery,
      operatorName: defaultOperatorName(user),
    });
    setAiPreview(null);
    setErrors({});
    setSavedNotice("");
  };

  const startEditRecord = (record) => {
    setShowForm(true);
    setEditingRecordId(record.id);
    setForm({
      ...emptyRecord,
      elderId: record.elderId || "",
      relatedOpportunityId: record.relatedOpportunityId || "",
      serviceType: record.serviceType || emptyRecord.serviceType,
      durationHours: Number(record.durationHours) || emptyRecord.durationHours,
      elderStatus: record.elderStatus || emptyRecord.elderStatus,
      content: record.content || "",
      newInfo: record.newInfo || "",
      nextSuggestion: record.nextSuggestion || "",
      operatorName: record.operatorName || defaultOperatorName(user),
    });
    setAiPreview(null);
    setErrors({});
    setSavedNotice("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRecordId("");
    setForm({ ...emptyRecord, operatorName: defaultOperatorName(user) });
    setAiPreview(null);
    setErrors({});
    setSearchParams({});
  };

  const generatePreview = () => {
    if (!selectedElder || !form.content.trim()) return;
    setAiPreview(analyzeServiceRecord({ elder: selectedElder, record: form }));
  };

  const handleDelete = async (record) => {
    const confirmed = window.confirm("确认删除这条服务记录吗？删除后不可恢复。");
    if (!confirmed) return;

    try {
      await deleteRecord(record.id, record);
      setSavedNotice("服务记录已删除。");
      if (editingRecordId === record.id) {
        closeForm();
      }
    } catch {
      // Error is surfaced through saveError in useServiceData.
    }
  };

  const handleConfirmGeneratedOpportunity = async (record, candidate) => {
    const confirmed = window.confirm(
      `确认生成正式服务机会？\n\n${candidate?.title || "未命名候选服务机会"}`
    );
    if (!confirmed) return;

    const candidateKey = getGeneratedOpportunityIdentity(candidate);
    setPendingGeneratedOpportunityKey(candidateKey);
    setPendingGeneratedOpportunityAction("confirm");
    setSavedNotice("");

    try {
      const result = await confirmGeneratedOpportunity(record, candidate);
      if (result?.alreadyConfirmed) {
        setSavedNotice("该候选服务机会已生成正式机会。");
        return;
      }
      setSavedNotice("已生成正式服务机会，可在服务机会页查看。");
    } catch (error) {
      if (error?.code === "PARTIAL_CONFIRM") {
        setSavedNotice("服务机会已生成，但候选状态更新失败，请刷新后确认。");
        return;
      }
      if (String(error?.message || "").includes("Permission denied")) {
        setSavedNotice("你没有权限处理这条 AI 候选服务机会。");
        return;
      }
      setSavedNotice("生成正式服务机会失败，请稍后重试。");
    } finally {
      setPendingGeneratedOpportunityKey("");
      setPendingGeneratedOpportunityAction("");
    }
  };

  const handleIgnoreGeneratedOpportunity = async (record, candidate) => {
    const confirmed = window.confirm(
      `确认忽略这个候选服务机会？\n\n${candidate?.title || "未命名候选服务机会"}`
    );
    if (!confirmed) return;

    const candidateKey = getGeneratedOpportunityIdentity(candidate);
    setPendingGeneratedOpportunityKey(candidateKey);
    setPendingGeneratedOpportunityAction("ignore");
    setSavedNotice("");

    try {
      await ignoreGeneratedOpportunity(record, candidate);
      setSavedNotice("已忽略该候选服务机会。");
    } catch (error) {
      if (String(error?.message || "").includes("Permission denied")) {
        setSavedNotice("你没有权限处理这条 AI 候选服务机会。");
        return;
      }
      setSavedNotice("忽略候选服务机会失败，请稍后重试。");
    } finally {
      setPendingGeneratedOpportunityKey("");
      setPendingGeneratedOpportunityAction("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmittingRecord) return;

    const nextErrors = {};
    const operatorName = form.operatorName.trim() || defaultOperatorName(user);

    if (!form.elderId) nextErrors.elderId = "必须选择长者。";
    if (!form.serviceType.trim()) nextErrors.serviceType = "服务类型不能为空。";
    if (!form.elderStatus.trim()) nextErrors.elderStatus = "老人状态不能为空。";
    if (!form.content.trim()) nextErrors.content = "服务内容不能为空。";
    if (!operatorName) nextErrors.operatorName = "服务人员姓名不能为空。";
    if (form.relatedOpportunityId && !canCompleteSelectedOpportunity) {
      nextErrors.relatedOpportunityId = "你只能处理分配给自己的服务提醒。";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      window.alert("请先完善服务记录表单。");
      return;
    }

    setIsSubmittingRecord(true);
    try {
      const aiResult = analyzeServiceRecord({ elder: selectedElder, record: form });
      const now = new Date().toISOString();
      const durationHours = Number(form.durationHours) || emptyRecord.durationHours;

      if (editingRecordId) {
        const existingRecord = records.find((item) => item.id === editingRecordId);
        await updateRecord(
          editingRecordId,
          {
            serviceType: form.serviceType,
            durationHours,
            elderStatus: form.elderStatus,
            content: form.content,
            newInfo: form.newInfo,
            nextSuggestion: form.nextSuggestion || aiResult.nextSuggestion,
            operatorName,
            updatedAt: now,
          },
          existingRecord
        );
        closeForm();
        setSavedNotice("服务记录已更新。");
        return;
      }

      const recordPayload = {
        ...form,
        durationHours,
        durationStatus: defaultDurationStatus({ isVolunteer }),
        confirmedBy: isVolunteer ? "" : user?.id || "",
        confirmedAt: isVolunteer ? "" : now,
        operatorId: user?.id || "",
        operatorName,
        nextSuggestion: form.nextSuggestion || aiResult.nextSuggestion,
        createdAt: now,
        updatedAt: now,
      };

      if (!usingSupabase) {
        recordPayload.id = `rec-${Date.now()}`;
      }

      await addRecord(recordPayload);
      closeForm();
      setSavedNotice(
        form.relatedOpportunityId
          ? "服务记录已保存，对应服务机会已完成。"
          : "服务记录已保存。"
      );
    } catch {
      // Error is surfaced through saveError in useServiceData.
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  const handleConfirmDuration = async (record) => {
    try {
      const now = new Date().toISOString();
      await updateRecord(
        record.id,
        {
          durationStatus: "confirmed",
          confirmedBy: user?.id || "",
          confirmedAt: now,
          updatedAt: now,
        },
        record
      );
      setSavedNotice("服务时长已确认。");
    } catch {
      // Error is surfaced through saveError in useServiceData.
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold text-app-ink">服务记录</h1>
            <p className="mt-2 text-lg font-medium text-app-muted">
              用一两分钟记录真实服务过程，沉淀长者近况和下次建议。
            </p>
            <p className="mt-3 rounded-2xl bg-app-cream px-4 py-3 text-sm font-bold leading-6 text-app-ink">
              服务记录仅用于机构内部服务辅助，涉及隐私内容请尽量脱敏记录。
            </p>
          </div>
          {canCreateServiceRecords ? (
            <button
              type="button"
              onClick={showForm ? closeForm : openForm}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-orange text-white shadow-sm active:scale-[0.99]"
              aria-label={showForm ? "关闭表单" : "新增服务记录"}
            >
              {showForm ? <X size={24} /> : <Plus size={24} />}
            </button>
          ) : null}
        </div>
      </section>

      {readErrors.records || saveError ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-base font-bold leading-7 text-app-orange">
          {saveError || readErrors.records}
        </section>
      ) : null}

      {showRefreshingBanner ? (
        <section className="rounded-[24px] bg-app-blue p-4 text-sm font-bold leading-6 text-app-ink">
          正在同步服务记录...
        </section>
      ) : null}

      {refreshNotice ? (
        <section className="rounded-[24px] bg-app-orangeSoft p-4 text-sm font-bold leading-6 text-app-orange">
          {refreshNotice}
        </section>
      ) : null}

      {savedNotice ? (
        <section className="rounded-[24px] bg-app-green p-4 text-base font-bold leading-7 text-app-ink">
          {savedNotice}
        </section>
      ) : null}

      {showForm && canCreateServiceRecords ? (
        <form
          className="space-y-4 rounded-[30px] bg-app-white p-5 shadow-card"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="text-2xl font-extrabold text-app-ink">
              {editingRecordId ? "编辑服务记录" : "新增服务记录"}
            </h2>
            <p className="mt-2 text-base leading-7 text-app-muted">
              {editingRecordId
                ? "你可以修正本次服务记录中的服务内容、状态和下次建议。"
                : "保存后会记录本次服务；如从服务机会进入，会自动完成对应机会。"}
            </p>
          </div>

          {form.relatedOpportunityId && relatedOpportunityTitle ? (
            <section className="rounded-[24px] bg-app-orangeSoft p-4">
              <p className="text-sm font-bold text-app-orange">本次记录关联服务机会</p>
              <h3 className="mt-2 text-lg font-extrabold text-app-ink">{relatedOpportunityTitle}</h3>
              {selectedOpportunity ? (
                <div className="mt-2 space-y-1 text-base leading-7 text-app-ink/80">
                  <p>{selectedOpportunity.type} 服务机会</p>
                  <p>负责人：{selectedOpportunity.assignedToName || "未分配"}</p>
                </div>
              ) : null}
              {errors.relatedOpportunityId ? (
                <p className="mt-2 text-sm font-bold text-app-orange">{errors.relatedOpportunityId}</p>
              ) : null}
            </section>
          ) : null}

          <FormField label="选择长者" error={errors.elderId}>
            <select
              className="text-lg"
              value={form.elderId}
              onChange={(event) => updateField("elderId", event.target.value)}
              required
              disabled={Boolean(editingRecordId)}
            >
              <option value="">请选择长者</option>
              {activeElders.map((elder) => (
                <option key={elder.id} value={elder.id}>
                  {elder.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="服务类型" error={errors.serviceType}>
            <select
              className="text-lg"
              value={form.serviceType}
              onChange={(event) => updateField("serviceType", event.target.value)}
            >
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="服务时长"
            hint="服务时长用于志愿服务记录和机构统计，不作为薪酬或劳务结算依据。"
          >
            <select
              className="text-lg"
              value={String(form.durationHours || emptyRecord.durationHours)}
              onChange={(event) => updateField("durationHours", Number(event.target.value))}
            >
              {SERVICE_DURATION_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="老人状态" error={errors.elderStatus}>
            <div className="grid grid-cols-2 gap-3">
              {elderStatuses.map((status) => {
                const active = form.elderStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateField("elderStatus", status)}
                    className={`rounded-[20px] px-4 py-3 text-base font-extrabold active:scale-[0.99] ${
                      active ? "bg-app-orange text-white" : "bg-app-cream text-app-ink"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </FormField>

          <FormField label="今天聊了什么 / 服务内容" error={errors.content}>
            <TextArea
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              placeholder="例如：聊了孙女考试、阳台花草和年轻时的工作。"
              required
            />
          </FormField>

          <FormField label="新发现的信息">
            <TextArea
              value={form.newInfo}
              onChange={(event) => updateField("newInfo", event.target.value)}
              placeholder="例如：最近惦记孙女，午后容易累。"
            />
          </FormField>

          <FormField label="下次建议" hint="可留空，使用本地辅助生成">
            <TextArea
              value={nextSuggestionToText(form.nextSuggestion)}
              onChange={(event) => updateField("nextSuggestion", event.target.value)}
              placeholder="留空时，系统会根据本次记录生成建议。"
            />
          </FormField>

          <FormField label="服务人员姓名" error={errors.operatorName}>
            <input
              className="text-lg"
              value={form.operatorName}
              onChange={(event) => updateField("operatorName", event.target.value)}
              placeholder="例如：李晨"
              required
            />
          </FormField>

          <button
            type="button"
            onClick={generatePreview}
            className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-app-blue px-5 py-4 text-lg font-extrabold text-app-ink active:scale-[0.99]"
          >
            <Sparkles size={22} />
            预生成建议
          </button>

          {aiPreview ? (
            <section className="rounded-[24px] bg-app-orangeSoft p-4">
              <h3 className="text-lg font-extrabold text-app-ink">建议预览</h3>
              <p className="mt-2 text-base leading-7 text-app-ink">
                {nextSuggestionToText(aiPreview.nextSuggestion)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(aiPreview.suggestedTags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-app-white px-3 py-1.5 text-sm font-bold text-app-ink"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <button
            type="submit"
            disabled={isSubmittingRecord}
            className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-app-orange px-5 py-4 text-lg font-extrabold text-white shadow-sm active:scale-[0.99] disabled:bg-app-line disabled:text-app-muted"
          >
            <CheckCircle2 size={22} />
            {isSubmittingRecord ? "正在保存..." : editingRecordId ? "保存修改" : "保存服务记录"}
          </button>
        </form>
      ) : null}

      <section className="space-y-3">
        <div className="grid gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-extrabold text-app-ink">记录列表</h2>
            <span className="text-base font-bold text-app-muted">{filteredRecords.length} 条</span>
          </div>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索长者姓名或记录内容"
          />
        </div>

        <div className="space-y-4">
          {initialLoading ? (
            <EmptyState title="正在加载服务记录" note="请稍候。" />
          ) : filteredRecords.length ? (
            filteredRecords.map((record) => {
              const sourceOpportunity = opportunities.find(
                (item) => item.id === record.relatedOpportunityId
              );
              const canEditRecord = canMutateRecord(record, user, {
                isOrgAdmin,
                isStaff,
                isVolunteer,
              });
              const canDeleteRecord = canMutateRecord(record, user, {
                isOrgAdmin,
                isStaff,
                isVolunteer,
              });

              return (
                <RecordCard
                  key={record.id}
                  record={record}
                  elderName={elderName(record.elderId)}
                  sourceOpportunity={sourceOpportunity}
                  isOrgAdmin={isOrgAdmin}
                  isStaff={isStaff}
                  isVolunteer={isVolunteer}
                  currentUserId={user?.id || ""}
                  pendingGeneratedOpportunityKey={pendingGeneratedOpportunityKey}
                  pendingGeneratedOpportunityAction={pendingGeneratedOpportunityAction}
                  canEdit={canEditRecord}
                  canDelete={canDeleteRecord}
                  onConfirmGeneratedOpportunity={handleConfirmGeneratedOpportunity}
                  onIgnoreGeneratedOpportunity={handleIgnoreGeneratedOpportunity}
                  onConfirmDuration={handleConfirmDuration}
                  onEdit={startEditRecord}
                  onDelete={handleDelete}
                />
              );
            })
          ) : (
            <EmptyState
              title="暂无服务记录"
              note="每一次陪伴后，都可以用一两分钟记录本次服务。"
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default RecordsPage;
