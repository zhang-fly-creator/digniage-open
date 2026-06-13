import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DATA_PROVIDER, dataProvider, isUsingSupabaseProvider } from "../services/dataProvider";
import { useAuthData } from "./useAuthData.jsx";
import {
  archiveElder as archiveLocalElder,
  getElderById as getLocalElderById,
  getElders as getLocalElders,
  restoreElder as restoreLocalElder,
  saveElder as saveLocalElder,
} from "../utils/storage";
import {
  canEditElderSensitiveInfo as canEditSensitiveInfoByRole,
  canViewElderSensitiveInfo as canViewSensitiveInfoByRole,
  stripSensitiveElderFields,
} from "../utils/privacy";

const READ_ERROR_MESSAGE = "当前机构读取失败，无法加载长者档案，请检查 Supabase 配置或 organizations 数据。";
const SAVE_ERROR_MESSAGE = "长者档案保存失败，请稍后重试。";

const elderCache = new Map();

function getCacheKey({ organizationId, userId, usingSupabase }) {
  return JSON.stringify({
    provider: usingSupabase ? "supabase" : "local",
    organizationId: organizationId || "",
    userId: userId || "",
  });
}

function readElderCache(cacheKey) {
  return elderCache.get(cacheKey) || null;
}

function writeElderCache(cacheKey, payload) {
  elderCache.set(cacheKey, {
    elders: Array.isArray(payload?.elders) ? payload.elders : [],
    error: payload?.error || "",
    updatedAt: payload?.updatedAt || new Date().toISOString(),
  });
}

function sanitizeElderForRole(elder, canViewSensitive) {
  if (!elder) return elder;
  return canViewSensitive ? elder : stripSensitiveElderFields(elder);
}

function sanitizeEldersForRole(elders = [], canViewSensitive) {
  return elders.map((elder) => sanitizeElderForRole(elder, canViewSensitive));
}

export function useElderData() {
  const {
    canManageElders,
    membership,
    user,
    loading: authLoading,
    usingSupabaseAuth,
    isAuthenticated,
    hasActiveMembership,
  } = useAuthData();
  const usingSupabase = isUsingSupabaseProvider();
  const role = membership?.role || "";
  const canViewSensitive = canViewSensitiveInfoByRole(role);
  const canEditSensitive = canEditSensitiveInfoByRole(role);
  const localElders = getLocalElders();
  const cacheKey = useMemo(
    () =>
      getCacheKey({
        organizationId: membership?.organizationId || "",
        userId: user?.id || "",
        usingSupabase,
      }),
    [membership?.organizationId, user?.id, usingSupabase]
  );
  const cached = useMemo(() => readElderCache(cacheKey), [cacheKey]);

  const [elders, setElders] = useState(() => cached?.elders || (usingSupabase ? [] : localElders));
  const [loading, setLoading] = useState(() => usingSupabase && !Boolean(cached?.elders?.length));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(() => cached?.error || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const eldersRef = useRef(elders);
  const cachedRef = useRef(cached);

  useEffect(() => {
    eldersRef.current = elders;
  }, [elders]);

  useEffect(() => {
    cachedRef.current = cached;
  }, [cached]);

  const reload = useCallback(async () => {
    const fallbackElders = eldersRef.current.length ? eldersRef.current : cachedRef.current?.elders || [];
    const hasCachedElders = fallbackElders.length > 0;
    setError("");

    if (!usingSupabase) {
      const nextElders = sanitizeEldersForRole(getLocalElders(), canViewSensitive);
      setElders(nextElders);
      setLoading(false);
      setRefreshing(false);
      writeElderCache(cacheKey, {
        elders: nextElders,
        error: "",
        updatedAt: new Date().toISOString(),
      });
      return nextElders;
    }

    if (authLoading) {
      setLoading(!hasCachedElders);
      setRefreshing(hasCachedElders);
      return fallbackElders;
    }

    if (usingSupabaseAuth && (!isAuthenticated || !hasActiveMembership)) {
      setElders([]);
      setLoading(false);
      setRefreshing(false);
      writeElderCache(cacheKey, {
        elders: [],
        error: "",
        updatedAt: new Date().toISOString(),
      });
      return [];
    }

    setLoading(!hasCachedElders);
    setRefreshing(hasCachedElders);
    try {
      const nextElders = sanitizeEldersForRole(await dataProvider.getElders(), canViewSensitive);
      setElders(nextElders);
      writeElderCache(cacheKey, {
        elders: nextElders,
        error: "",
        updatedAt: new Date().toISOString(),
      });
      return nextElders;
    } catch (nextError) {
      console.error(nextError);
      setError(READ_ERROR_MESSAGE);
      if (!hasCachedElders) {
        setElders([]);
      }
      return fallbackElders;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    authLoading,
    cacheKey,
    hasActiveMembership,
    isAuthenticated,
    usingSupabase,
    usingSupabaseAuth,
    canViewSensitive,
  ]);

  useEffect(() => {
    if (cached?.elders) {
      setElders(cached.elders);
    }
    if (cached?.error) {
      setError(cached.error);
    }
  }, [cached]);

  useEffect(() => {
    reload();
  }, [reload]);

  const getElderById = useCallback(
    async (id) => {
      if (!id) return null;
      if (!usingSupabase) return sanitizeElderForRole(getLocalElderById(id), canViewSensitive);
      const cachedElder = elders.find((item) => item.id === id) || cached?.elders?.find((item) => item.id === id);
      try {
        const full = sanitizeElderForRole(await dataProvider.getElderById(id), canViewSensitive);
        if (full) {
          setElders((previous) => {
            const next = previous.some((item) => item.id === id)
              ? previous.map((item) => (item.id === id ? full : item))
              : [full, ...previous];
            writeElderCache(cacheKey, {
              elders: next,
              error: "",
              updatedAt: new Date().toISOString(),
            });
            return next;
          });
        }
        return full;
      } catch (nextError) {
        console.error(nextError);
        setError(READ_ERROR_MESSAGE);
        return cachedElder || null;
      }
    },
    [cacheKey, canViewSensitive, usingSupabase]
  );

  const saveElder = useCallback(
    async (elder) => {
      setSaving(true);
      setSaveError("");
      try {
        const existingSensitive =
          eldersRef.current.find((item) => item.id === elder.id) ||
          cachedRef.current?.elders?.find((item) => item.id === elder.id) ||
          {};
        const payload = canEditSensitive
          ? { ...elder }
          : {
              ...elder,
              idCardNumber: existingSensitive.idCardNumber || "",
              idCardLast4: existingSensitive.idCardLast4 || "",
              idCardUpdatedAt: existingSensitive.idCardUpdatedAt || "",
              idCardUpdatedBy: existingSensitive.idCardUpdatedBy || "",
            };
        let saved;
        if (usingSupabase) {
          saved = payload.id
            ? await dataProvider.updateElder(payload.id, payload)
            : await dataProvider.createElder(payload);
        } else {
          saved = saveLocalElder(payload);
        }
        await reload();
        return saved;
      } catch (nextError) {
        console.error(nextError);
        setSaveError(SAVE_ERROR_MESSAGE);
        throw nextError;
      } finally {
        setSaving(false);
      }
    },
    [canEditSensitive, reload, usingSupabase]
  );

  const archiveElder = useCallback(
    async (id, reason) => {
      setSaveError("");
      if (!canManageElders) {
        setSaveError("你当前没有权限，请联系机构管理员。");
        throw new Error("Permission denied.");
      }
      try {
        if (usingSupabase) {
          await dataProvider.archiveElder(id, reason);
        } else {
          archiveLocalElder(id, reason);
        }
        await reload();
      } catch (nextError) {
        console.error(nextError);
        setSaveError("长者档案归档失败，请稍后重试。");
        throw nextError;
      }
    },
    [canManageElders, reload, usingSupabase]
  );

  const restoreElder = useCallback(
    async (id) => {
      setSaveError("");
      if (!canManageElders) {
        setSaveError("你当前没有权限，请联系机构管理员。");
        throw new Error("Permission denied.");
      }
      try {
        if (usingSupabase) {
          await dataProvider.restoreElder(id);
        } else {
          restoreLocalElder(id);
        }
        await reload();
      } catch (nextError) {
        console.error(nextError);
        setSaveError("长者档案恢复失败，请稍后重试。");
        throw nextError;
      }
    },
    [canManageElders, reload, usingSupabase]
  );

  return {
    dataProviderName: DATA_PROVIDER,
    usingSupabase,
    elders,
    loading,
    refreshing,
    initialLoading: loading && !elders.length,
    canViewElderSensitiveInfo: canViewSensitive,
    canEditElderSensitiveInfo: canEditSensitive,
    error,
    saving,
    saveError,
    reload,
    getElderById,
    saveElder,
    archiveElder,
    restoreElder,
  };
}
