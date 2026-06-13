import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { analyzeServiceRecord } from "../services/aiService";
import { dataProvider, isUsingSupabaseProvider } from "../services/dataProvider";
import { normalizeGeneratedOpportunities } from "../services/storageService";
import { getAssignableMembers } from "../services/memberService";
import { buildDemoOpportunities } from "../utils/demoOpportunities";
import { stripSensitiveElderFields } from "../utils/privacy";
import { useAuthData } from "./useAuthData.jsx";
import {
  addServiceRecord as addLocalServiceRecord,
  dismissOpportunity as dismissLocalOpportunity,
  ensureSeedData,
  getElders as getLocalElders,
  getOpportunities as getLocalOpportunities,
  getRecords as getLocalRecords,
} from "../utils/storage";

const ORGANIZATION_SERVICE_ERROR =
  "当前机构读取失败，无法加载服务数据，请检查 Supabase 配置或 organizations 数据。";
const SERVICE_DATA_ERROR = "服务数据加载失败，请检查 Supabase 配置或稍后重试。";
const DISMISS_ERROR = "关闭服务机会失败，请稍后重试。";
const SAVE_ERROR = "保存失败，请稍后重试。";
const CREATE_OPPORTUNITY_ERROR = "服务提醒创建失败，请稍后重试。";
const ASSIGN_OPPORTUNITY_ERROR = "负责人更新失败，请稍后重试。";

const serviceCache = new Map();

function normalizeServiceError(error) {
  const message = String(error?.message || error || "");
  if (message.toLowerCase().includes("organization")) {
    return ORGANIZATION_SERVICE_ERROR;
  }
  return SERVICE_DATA_ERROR;
}

function getFailureMessage(result) {
  return result.status === "rejected" ? normalizeServiceError(result.reason) : "";
}

function getCacheKey({ usingSupabase, organizationId, userId, isVolunteer }) {
  return JSON.stringify({
    provider: usingSupabase ? "supabase" : "local",
    organizationId: organizationId || "",
    userId: userId || "",
    isVolunteer: Boolean(isVolunteer),
  });
}

function readServiceCache(cacheKey) {
  return serviceCache.get(cacheKey) || null;
}

function writeServiceCache(cacheKey, payload) {
  serviceCache.set(cacheKey, {
    elders: Array.isArray(payload?.elders) ? payload.elders : [],
    opportunities: Array.isArray(payload?.opportunities) ? payload.opportunities : [],
    records: Array.isArray(payload?.records) ? payload.records : [],
    assignableMembers: Array.isArray(payload?.assignableMembers) ? payload.assignableMembers : [],
    readErrors: payload?.readErrors || {
      elders: "",
      opportunities: "",
      records: "",
      members: "",
    },
    error: payload?.error || "",
    updatedAt: payload?.updatedAt || new Date().toISOString(),
  });
}

function sanitizeServiceElders(elders = []) {
  return elders.map((elder) => stripSensitiveElderFields(elder));
}

function buildServiceRecordArtifacts({ elder, record }) {
  const aiResult = analyzeServiceRecord({ elder, record });
  return {
    aiResult,
    generatedOpportunities: normalizeGeneratedOpportunities(
      record.generatedOpportunities?.length
        ? record.generatedOpportunities
        : aiResult.generatedOpportunities || (aiResult.serviceOpportunity ? [aiResult.serviceOpportunity] : [])
    ),
  };
}

function sanitizeRecordsForViewer(records = [], { isVolunteer }) {
  return records.map((record) => ({
    ...record,
    generatedOpportunities: isVolunteer
      ? []
      : normalizeGeneratedOpportunities(record.generatedOpportunities),
  }));
}

function canMutateServiceRecord({ record, userId, isOrgAdmin, isStaff, isVolunteer }) {
  if (!record) return false;
  if (isOrgAdmin) return true;
  if (!record.operatorId || record.operatorId !== userId) return false;
  return isStaff || isVolunteer;
}

function canReviewGeneratedOpportunity({ record, userId, isOrgAdmin, isStaff }) {
  if (!record) return false;
  if (isOrgAdmin) return true;
  return Boolean(isStaff && record.operatorId && record.operatorId === userId);
}

function matchGeneratedOpportunity(target, candidate) {
  if (!target || !candidate) return false;
  if (target.id && candidate.id) return target.id === candidate.id;

  return (
    String(target.type || "") === String(candidate.type || "") &&
    String(target.title || "") === String(candidate.title || "") &&
    String(target.description || "") === String(candidate.description || "")
  );
}

function updateGeneratedOpportunityStatus(items = [], candidate, patch) {
  let matched = false;
  const nextItems = normalizeGeneratedOpportunities(items).map((item) => {
    if (!matched && matchGeneratedOpportunity(item, candidate)) {
      matched = true;
      return { ...item, ...patch };
    }
    return item;
  });

  return {
    matched,
    items: nextItems,
  };
}

export function useServiceData() {
  const {
    canCloseOpportunities,
    canCompleteOpportunities,
    canAssignOpportunities,
    canCreateServiceOpportunities,
    canCreateServiceRecords,
    isOrgAdmin,
    isStaff,
    isVolunteer,
    membership,
    organization,
    loading: authLoading,
    usingSupabaseAuth,
    hasActiveMembership,
    isAuthenticated,
    user,
  } = useAuthData();
  const usingSupabase = isUsingSupabaseProvider();

  const cacheKey = useMemo(
    () =>
      getCacheKey({
        usingSupabase,
        organizationId: organization?.id || membership?.organizationId || "",
        userId: user?.id || "",
        isVolunteer,
      }),
    [isVolunteer, membership?.organizationId, organization?.id, user?.id, usingSupabase]
  );
  const cached = useMemo(() => readServiceCache(cacheKey), [cacheKey]);

  const [elders, setElders] = useState(() => cached?.elders || []);
  const [opportunities, setOpportunities] = useState(() => cached?.opportunities || []);
  const [records, setRecords] = useState(() => cached?.records || []);
  const [assignableMembers, setAssignableMembers] = useState(() => cached?.assignableMembers || []);
  const [loading, setLoading] = useState(() => !(cached?.elders?.length || cached?.opportunities?.length || cached?.records?.length));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(() => cached?.error || "");
  const [dismissError, setDismissError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [createOpportunityError, setCreateOpportunityError] = useState("");
  const [assignOpportunityError, setAssignOpportunityError] = useState("");
  const eldersRef = useRef(elders);
  const opportunitiesRef = useRef(opportunities);
  const recordsRef = useRef(records);
  const assignableMembersRef = useRef(assignableMembers);
  const cachedRef = useRef(cached);
  const [readErrors, setReadErrors] = useState(
    () =>
      cached?.readErrors || {
        elders: "",
        opportunities: "",
        records: "",
        members: "",
      }
  );

  useEffect(() => {
    eldersRef.current = elders;
  }, [elders]);

  useEffect(() => {
    opportunitiesRef.current = opportunities;
  }, [opportunities]);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    assignableMembersRef.current = assignableMembers;
  }, [assignableMembers]);

  useEffect(() => {
    cachedRef.current = cached;
  }, [cached]);

  const reload = useCallback(async () => {
    const hasCachedData =
      eldersRef.current.length > 0 ||
      opportunitiesRef.current.length > 0 ||
      recordsRef.current.length > 0 ||
      assignableMembersRef.current.length > 0 ||
      (cachedRef.current?.elders?.length || 0) > 0 ||
      (cachedRef.current?.opportunities?.length || 0) > 0 ||
      (cachedRef.current?.records?.length || 0) > 0;

    setError("");
    setReadErrors({ elders: "", opportunities: "", records: "", members: "" });

    try {
      if (!usingSupabase) {
        ensureSeedData();
        const nextElders = sanitizeServiceElders(getLocalElders());
        const nextOpportunities = getLocalOpportunities();
        const nextRecords = sanitizeRecordsForViewer(getLocalRecords(), { isVolunteer });
        const nextMembers = await getAssignableMembers();
        setElders(nextElders);
        setOpportunities(nextOpportunities);
        setRecords(nextRecords);
        setAssignableMembers(nextMembers);
        setLoading(false);
        setRefreshing(false);
        writeServiceCache(cacheKey, {
          elders: nextElders,
          opportunities: nextOpportunities,
          records: nextRecords,
          assignableMembers: nextMembers,
          readErrors: { elders: "", opportunities: "", records: "", members: "" },
          error: "",
        });
        return;
      }

      if (authLoading) {
        setLoading(!hasCachedData);
        setRefreshing(hasCachedData);
        return;
      }

      if (usingSupabaseAuth && (!isAuthenticated || !hasActiveMembership)) {
        setElders([]);
        setOpportunities([]);
        setRecords([]);
        setAssignableMembers([]);
        setLoading(false);
        setRefreshing(false);
        writeServiceCache(cacheKey, {
        elders: [],
        opportunities: [],
        records: [],
        assignableMembers: [],
          readErrors: { elders: "", opportunities: "", records: "", members: "" },
          error: "",
        });
        return;
      }

      setLoading(!hasCachedData);
      setRefreshing(hasCachedData);

      const [eldersResult, opportunitiesResult, recordsResult, membersResult] = await Promise.allSettled([
        dataProvider.getElders(),
        dataProvider.getServiceOpportunities(),
        dataProvider.getServiceRecords(),
        getAssignableMembers(organization?.id),
      ]);

      const nextElders =
        eldersResult.status === "fulfilled"
          ? sanitizeServiceElders(eldersResult.value || [])
          : eldersRef.current;

      if (eldersResult.status === "fulfilled") {
        setElders(nextElders);
      } else {
        console.error(eldersResult.reason);
        if (!hasCachedData) setElders([]);
      }

      let nextOpportunities = opportunitiesRef.current;
      if (opportunitiesResult.status === "fulfilled") {
        const loadedOpportunities = opportunitiesResult.value || [];
        nextOpportunities = loadedOpportunities.length
          ? loadedOpportunities
          : buildDemoOpportunities(
              eldersResult.status === "fulfilled" ? eldersResult.value || [] : nextElders,
              organization?.id || membership?.organizationId || ""
            );
        setOpportunities(nextOpportunities);
      } else {
        console.error(opportunitiesResult.reason);
        if (!hasCachedData) setOpportunities([]);
      }

      const nextRecords =
        recordsResult.status === "fulfilled"
          ? sanitizeRecordsForViewer(recordsResult.value || [], { isVolunteer })
          : recordsRef.current;
      if (recordsResult.status === "fulfilled") {
        setRecords(nextRecords);
      } else {
        console.error(recordsResult.reason);
        if (!hasCachedData) setRecords([]);
      }

      const nextMembers =
        membersResult.status === "fulfilled" ? membersResult.value || [] : assignableMembersRef.current;
      if (membersResult.status === "fulfilled") {
        setAssignableMembers(nextMembers);
      } else {
        console.error(membersResult.reason);
        if (!hasCachedData) setAssignableMembers([]);
      }

      const nextReadErrors = {
        elders: getFailureMessage(eldersResult),
        opportunities: getFailureMessage(opportunitiesResult),
        records: getFailureMessage(recordsResult),
        members: getFailureMessage(membersResult),
      };
      const nextError = Object.values(nextReadErrors).find(Boolean) || "";
      setReadErrors(nextReadErrors);
      setError(nextError);

      writeServiceCache(cacheKey, {
        elders: eldersResult.status === "fulfilled" ? nextElders : eldersRef.current,
        opportunities: opportunitiesResult.status === "fulfilled" ? nextOpportunities : opportunitiesRef.current,
        records: recordsResult.status === "fulfilled" ? nextRecords : recordsRef.current,
        assignableMembers: membersResult.status === "fulfilled" ? nextMembers : assignableMembersRef.current,
        readErrors: nextReadErrors,
        error: nextError,
      });
    } catch (nextError) {
      console.error(nextError);
      setError(normalizeServiceError(nextError));
      if (!hasCachedData) {
        setElders([]);
        setOpportunities([]);
        setRecords([]);
        setAssignableMembers([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    authLoading,
    cacheKey,
    hasActiveMembership,
    isAuthenticated,
    isVolunteer,
    membership?.organizationId,
    organization?.id,
    usingSupabase,
    usingSupabaseAuth,
  ]);

  useEffect(() => {
    if (cached) {
      setElders(cached.elders || []);
      setOpportunities(cached.opportunities || []);
      setRecords(cached.records || []);
      setAssignableMembers(cached.assignableMembers || []);
      setReadErrors(
        cached.readErrors || {
          elders: "",
          opportunities: "",
          records: "",
          members: "",
        }
      );
      setError(cached.error || "");
    }
  }, [cached]);

  useEffect(() => {
    reload();
  }, [reload]);

  const dismissOpportunity = useCallback(
    async (id, reason) => {
      setDismissError("");
      if (!canCloseOpportunities) {
        setDismissError("你当前没有权限，请联系机构管理员。");
        return false;
      }
      try {
        if (usingSupabase) {
          await dataProvider.dismissServiceOpportunity(id, reason);
        } else {
          dismissLocalOpportunity(id, reason);
        }
        await reload();
        return true;
      } catch (nextError) {
        setDismissError(DISMISS_ERROR);
        return false;
      }
    },
    [canCloseOpportunities, reload, usingSupabase]
  );

  const addRecord = useCallback(
    async (record) => {
      setSaveError("");
      if (!canCreateServiceRecords) {
        setSaveError("你当前没有权限，请联系机构管理员。");
        throw new Error("Permission denied.");
      }
      const relatedOpportunity = opportunities.find(
        (opportunity) => opportunity.id === record.relatedOpportunityId
      );
      const canCompleteRelatedOpportunity =
        !record.relatedOpportunityId ||
        canCompleteOpportunities ||
        relatedOpportunity?.assignedToUserId === user?.id;

      if (!canCompleteRelatedOpportunity) {
        setSaveError("你只能处理分配给自己的服务提醒。");
        throw new Error("Permission denied.");
      }
      try {
        const elder = elders.find((item) => item.id === record.elderId);
        const { aiResult, generatedOpportunities } = buildServiceRecordArtifacts({
          elder,
          record,
        });
        const enrichedRecord = {
          ...record,
          nextSuggestion: record.nextSuggestion || aiResult.nextSuggestion,
          aiSuggestedTags: record.aiSuggestedTags || aiResult.suggestedTags || [],
          generatedOpportunities,
        };
        const savedRecord = usingSupabase
          ? await dataProvider.addServiceRecord(enrichedRecord)
          : addLocalServiceRecord(enrichedRecord);
        await reload();
        return savedRecord;
      } catch (nextError) {
        setSaveError(SAVE_ERROR);
        throw nextError;
      }
    },
    [
      canCompleteOpportunities,
      canCreateServiceRecords,
      elders,
      opportunities,
      reload,
      user?.id,
      usingSupabase,
    ]
  );

  const updateRecord = useCallback(
    async (recordId, patch, existingRecord) => {
      setSaveError("");
      if (
        !canMutateServiceRecord({
          record: existingRecord,
          userId: user?.id,
          isOrgAdmin,
          isStaff,
          isVolunteer,
        })
      ) {
        setSaveError("你当前没有编辑这条服务记录的权限。");
        throw new Error("Permission denied.");
      }

      try {
        const savedRecord = await dataProvider.updateServiceRecord(recordId, patch);
        await reload();
        return savedRecord;
      } catch (nextError) {
        setSaveError(SAVE_ERROR);
        throw nextError;
      }
    },
    [isOrgAdmin, isStaff, isVolunteer, reload, user?.id]
  );

  const deleteRecord = useCallback(
    async (recordId, existingRecord) => {
      setSaveError("");
      if (
        !canMutateServiceRecord({
          record: existingRecord,
          userId: user?.id,
          isOrgAdmin,
          isStaff,
          isVolunteer,
        })
      ) {
        setSaveError("你当前没有删除这条服务记录的权限。");
        throw new Error("Permission denied.");
      }

      try {
        await dataProvider.deleteServiceRecord(recordId);
        await reload();
        return true;
      } catch (nextError) {
        setSaveError(SAVE_ERROR);
        throw nextError;
      }
    },
    [isOrgAdmin, isStaff, isVolunteer, reload, user?.id]
  );

  const createOpportunity = useCallback(
    async (opportunity) => {
      setCreateOpportunityError("");
      if (!canCreateServiceOpportunities) {
        setCreateOpportunityError("你当前没有创建服务提醒权限，请联系机构管理员。");
        throw new Error("Permission denied.");
      }

      try {
        const now = new Date().toISOString();
        const savedOpportunity = await dataProvider.createServiceOpportunity({
          ...opportunity,
          status: opportunity.status || "pending",
          source: opportunity.source || "manual",
          createdByUserId: user?.id || "",
          createdByName: user?.name || String(user?.email || "").split("@")[0] || "",
          createdByRole: membership?.role || "",
          createdAt: opportunity.createdAt || now,
          updatedAt: opportunity.updatedAt || now,
        });
        await reload();
        return savedOpportunity;
      } catch (nextError) {
        setCreateOpportunityError(CREATE_OPPORTUNITY_ERROR);
        throw nextError;
      }
    },
    [canCreateServiceOpportunities, membership?.role, reload, user?.email, user?.id, user?.name]
  );

  const confirmGeneratedOpportunity = useCallback(
    async (record, candidate) => {
      setSaveError("");
      if (
        !canReviewGeneratedOpportunity({
          record,
          userId: user?.id,
          isOrgAdmin,
          isStaff,
        })
      ) {
        setSaveError("你没有权限处理这条 AI 候选服务机会。");
        throw new Error("Permission denied.");
      }

      const currentCandidates = normalizeGeneratedOpportunities(record?.generatedOpportunities);
      const currentCandidate = currentCandidates.find((item) => matchGeneratedOpportunity(item, candidate));
      if (!currentCandidate) {
        throw new Error("Candidate not found.");
      }
      if (
        currentCandidate.reviewStatus === "confirmed" ||
        currentCandidate.confirmedOpportunityId
      ) {
        return {
          alreadyConfirmed: true,
          opportunityId: currentCandidate.confirmedOpportunityId || "",
        };
      }

      const now = new Date().toISOString();
      const newOpportunity = await dataProvider.createServiceOpportunity({
        organizationId: record.organizationId || organization?.id || membership?.organizationId || "",
        elderId: record.elderId || "",
        relatedRecordId: record.id || "",
        type: currentCandidate.type || "",
        title: currentCandidate.title || "",
        description: currentCandidate.description || "",
        status: "pending",
        source: "ai",
        createdByUserId: user?.id || "",
        createdByName: user?.name || String(user?.email || "").split("@")[0] || "",
        createdByRole: membership?.role || "",
        createdAt: now,
        updatedAt: now,
      });

      const updatedCandidates = updateGeneratedOpportunityStatus(
        currentCandidates,
        currentCandidate,
        {
          reviewStatus: "confirmed",
          confirmedOpportunityId: newOpportunity.id,
          confirmedAt: now,
        }
      );

      if (!updatedCandidates.matched) {
        await reload();
        return {
          opportunity: newOpportunity,
          partial: true,
        };
      }

      try {
        await dataProvider.updateServiceRecord(record.id, {
          generatedOpportunities: updatedCandidates.items,
          updatedAt: now,
        });
      } catch (error) {
        await reload();
        const partialError = new Error(
          "服务机会已生成，但候选状态更新失败，请刷新后确认。"
        );
        partialError.code = "PARTIAL_CONFIRM";
        partialError.cause = error;
        throw partialError;
      }

      await reload();
      return {
        opportunity: newOpportunity,
      };
    },
    [
      isOrgAdmin,
      isStaff,
      membership?.organizationId,
      membership?.role,
      organization?.id,
      reload,
      user?.email,
      user?.id,
      user?.name,
    ]
  );

  const ignoreGeneratedOpportunity = useCallback(
    async (record, candidate) => {
      setSaveError("");
      if (
        !canReviewGeneratedOpportunity({
          record,
          userId: user?.id,
          isOrgAdmin,
          isStaff,
        })
      ) {
        setSaveError("你没有权限处理这条 AI 候选服务机会。");
        throw new Error("Permission denied.");
      }

      const now = new Date().toISOString();
      const updatedCandidates = updateGeneratedOpportunityStatus(
        record?.generatedOpportunities,
        candidate,
        {
          reviewStatus: "ignored",
          ignoredAt: now,
        }
      );

      if (!updatedCandidates.matched) {
        throw new Error("Candidate not found.");
      }

      try {
        const savedRecord = await dataProvider.updateServiceRecord(record.id, {
          generatedOpportunities: updatedCandidates.items,
          updatedAt: now,
        });
        await reload();
        return savedRecord;
      } catch (error) {
        setSaveError(SAVE_ERROR);
        throw error;
      }
    },
    [isOrgAdmin, isStaff, reload, user?.id]
  );

  const assignOpportunity = useCallback(
    async (opportunityId, memberId) => {
      setAssignOpportunityError("");
      if (!canAssignOpportunities) {
        setAssignOpportunityError("你当前没有指派服务提醒权限。");
        throw new Error("Permission denied.");
      }

      const member = assignableMembers.find((item) => item.id === memberId);
      const now = new Date().toISOString();
      const patch = member
        ? {
            assignedToUserId: member.userId,
            assignedToMemberId: member.id,
            assignedToName: member.name || member.email || "未命名成员",
            assignedRole: member.role,
            assignedAt: now,
            assignedBy: user?.id || "",
            updatedAt: now,
          }
        : {
            assignedToUserId: "",
            assignedToMemberId: "",
            assignedToName: "",
            assignedRole: "",
            assignedAt: "",
            assignedBy: user?.id || "",
            updatedAt: now,
          };

      try {
        const savedOpportunity = await dataProvider.updateServiceOpportunity(opportunityId, patch);
        await reload();
        return savedOpportunity;
      } catch (nextError) {
        setAssignOpportunityError(ASSIGN_OPPORTUNITY_ERROR);
        throw nextError;
      }
    },
    [assignableMembers, canAssignOpportunities, reload, user?.id]
  );

  return {
    elders,
    opportunities,
    records,
    assignableMembers,
    loading,
    refreshing,
    initialLoading: loading && !elders.length && !opportunities.length && !records.length,
    error,
    dismissError,
    saveError,
    createOpportunityError,
    assignOpportunityError,
    readErrors,
    usingSupabase,
    reload,
    dismissOpportunity,
    createOpportunity,
    confirmGeneratedOpportunity,
    ignoreGeneratedOpportunity,
    assignOpportunity,
    addRecord,
    updateRecord,
    deleteRecord,
  };
}
