import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DATA_PROVIDER,
  dataProvider,
  isSupabaseProviderRequested,
  isUsingSupabaseProvider,
} from "../services/dataProvider";
import { localStorageProvider } from "../services/providers/localStorageProvider";
import { useAuthData } from "./useAuthData.jsx";

const READ_ERROR_MESSAGE = "机构信息读取失败，请检查 Supabase 配置或稍后重试。";
const SAVE_ERROR_MESSAGE = "机构设置保存失败，请稍后重试。";

const organizationCache = new Map();

function getLocalOrganizationFallback() {
  return localStorageProvider.getCurrentOrganization();
}

function hasSameOrganizationIdentity(left, right) {
  return String(left?.id || "") === String(right?.id || "");
}

function getCacheKey({ organizationId, userId, usingSupabase }) {
  return JSON.stringify({
    provider: usingSupabase ? "supabase" : "local",
    organizationId: organizationId || "",
    userId: userId || "",
  });
}

function readOrganizationCache(cacheKey) {
  return organizationCache.get(cacheKey) || null;
}

function writeOrganizationCache(cacheKey, payload) {
  organizationCache.set(cacheKey, {
    organization: payload?.organization || null,
    error: payload?.error || "",
    updatedAt: payload?.updatedAt || new Date().toISOString(),
  });
}

export function useOrganizationData() {
  const {
    organization: authOrganization,
    membership,
    user,
    loading: authLoading,
    usingSupabaseAuth,
    isAuthenticated,
    hasActiveMembership,
  } = useAuthData();
  const usingSupabase = isUsingSupabaseProvider();
  const localFallback = getLocalOrganizationFallback();
  const localFallbackId = localFallback?.id || "";
  const cacheKey = useMemo(
    () =>
      getCacheKey({
        organizationId: authOrganization?.id || membership?.organizationId || localFallbackId,
        userId: user?.id || "",
        usingSupabase,
      }),
    [authOrganization?.id, localFallbackId, membership?.organizationId, user?.id, usingSupabase]
  );
  const cached = useMemo(() => readOrganizationCache(cacheKey), [cacheKey]);

  const [organization, setOrganization] = useState(
    () => cached?.organization || authOrganization || localFallback
  );
  const [loading, setLoading] = useState(() => usingSupabase && !Boolean(cached?.organization || authOrganization || localFallback));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(() => cached?.error || "");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const organizationRef = useRef(organization);
  const cachedRef = useRef(cached);
  const authOrganizationRef = useRef(authOrganization);
  const localFallbackRef = useRef(localFallback);

  authOrganizationRef.current = authOrganization;
  localFallbackRef.current = localFallback;

  useEffect(() => {
    organizationRef.current = organization;
  }, [organization]);

  useEffect(() => {
    cachedRef.current = cached;
  }, [cached]);

  const reloadOrganization = useCallback(async () => {
    const currentAuthOrganization = authOrganizationRef.current;
    const fallback =
      currentAuthOrganization ||
      organizationRef.current ||
      localFallbackRef.current ||
      cachedRef.current?.organization ||
      null;
    const hasCachedOrganization = Boolean(fallback?.id);
    setError("");

    if (!usingSupabase) {
      const nextOrganization = getLocalOrganizationFallback();
      if (!hasSameOrganizationIdentity(organizationRef.current, nextOrganization)) {
        setOrganization(nextOrganization);
      }
      setLoading(false);
      setRefreshing(false);
      writeOrganizationCache(cacheKey, {
        organization: nextOrganization,
        error: "",
        updatedAt: new Date().toISOString(),
      });
      return nextOrganization;
    }

    if (authLoading) {
      setLoading(!hasCachedOrganization);
      setRefreshing(hasCachedOrganization);
      return fallback;
    }

    if (usingSupabaseAuth && (!isAuthenticated || !hasActiveMembership)) {
      setOrganization(null);
      setLoading(false);
      setRefreshing(false);
      writeOrganizationCache(cacheKey, {
        organization: null,
        error: "",
        updatedAt: new Date().toISOString(),
      });
      return null;
    }

    setLoading(!hasCachedOrganization);
    setRefreshing(hasCachedOrganization);

    try {
      if (currentAuthOrganization?.id) {
        if (!hasSameOrganizationIdentity(organizationRef.current, currentAuthOrganization)) {
          setOrganization(currentAuthOrganization);
        }
        writeOrganizationCache(cacheKey, {
          organization: currentAuthOrganization,
          error: "",
          updatedAt: new Date().toISOString(),
        });
        return currentAuthOrganization;
      }

      const nextOrganization = await dataProvider.getCurrentOrganization();
      if (!hasSameOrganizationIdentity(organizationRef.current, nextOrganization)) {
        setOrganization(nextOrganization);
      }
      writeOrganizationCache(cacheKey, {
        organization: nextOrganization,
        error: "",
        updatedAt: new Date().toISOString(),
      });
      return nextOrganization;
    } catch (nextError) {
      console.error(nextError);
      setError(READ_ERROR_MESSAGE);
      if (!hasCachedOrganization) {
        const safeFallback = getLocalOrganizationFallback();
        if (!hasSameOrganizationIdentity(organizationRef.current, safeFallback)) {
          setOrganization(safeFallback);
        }
        return safeFallback;
      }
      return fallback;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    authLoading,
    authOrganization?.id,
    cacheKey,
    hasActiveMembership,
    isAuthenticated,
    usingSupabase,
    usingSupabaseAuth,
  ]);

  useEffect(() => {
    if (cached?.organization && !hasSameOrganizationIdentity(organizationRef.current, cached.organization)) {
      setOrganization(cached.organization);
    }
    if (cached?.error) {
      setError(cached.error);
    }
  }, [cached]);

  useEffect(() => {
    reloadOrganization();
  }, [membership?.organizationId, reloadOrganization]);

  const saveOrganization = useCallback(
    async (patch) => {
      setSaveError("");
      setSaving(true);
      try {
        const target = organization || authOrganization || getLocalOrganizationFallback();
        const updated = await dataProvider.updateOrganization(target.id, patch);
        setOrganization(updated);
        writeOrganizationCache(cacheKey, {
          organization: updated,
          error: "",
          updatedAt: new Date().toISOString(),
        });
        return updated;
      } catch (nextError) {
        console.error(nextError);
        setSaveError(SAVE_ERROR_MESSAGE);
        throw nextError;
      } finally {
        setSaving(false);
      }
    },
    [authOrganization, cacheKey, organization]
  );

  return {
    dataProviderName: DATA_PROVIDER,
    supabaseRequested: isSupabaseProviderRequested(),
    usingSupabase,
    organization,
    loading,
    refreshing,
    initialLoading: loading && !organization,
    error,
    saveError,
    saving,
    reloadOrganization,
    saveOrganization,
  };
}
