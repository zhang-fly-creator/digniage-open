import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dataProvider, isUsingSupabaseProvider } from "../services/dataProvider";
import { useAuthData } from "./useAuthData.jsx";

const READ_ERROR = "动态加载失败，请稍后重试。";
const SAVE_ERROR = "动态保存失败，请稍后重试。";

const newsCache = new Map();

function getCacheKey({ organizationOnly, usingSupabaseAuth, hasActiveMembership, isAuthenticated }) {
  return JSON.stringify({
    organizationOnly: Boolean(organizationOnly),
    usingSupabaseAuth: Boolean(usingSupabaseAuth),
    hasActiveMembership: Boolean(hasActiveMembership),
    isAuthenticated: Boolean(isAuthenticated),
  });
}

function readNewsCache(cacheKey) {
  return newsCache.get(cacheKey) || null;
}

function writeNewsCache(cacheKey, payload) {
  newsCache.set(cacheKey, {
    posts: Array.isArray(payload?.posts) ? payload.posts : [],
    error: payload?.error || "",
    updatedAt: payload?.updatedAt || new Date().toISOString(),
  });
}

export function useNewsData({ organizationOnly = false } = {}) {
  const {
    canPublishNews,
    loading: authLoading,
    usingSupabaseAuth,
    isAuthenticated,
    hasActiveMembership,
    user,
  } = useAuthData();

  const cacheKey = useMemo(
    () =>
      getCacheKey({
        organizationOnly,
        usingSupabaseAuth,
        hasActiveMembership,
        isAuthenticated,
      }),
    [hasActiveMembership, isAuthenticated, organizationOnly, usingSupabaseAuth]
  );
  const cached = useMemo(() => readNewsCache(cacheKey), [cacheKey]);

  const [posts, setPosts] = useState(() => cached?.posts || []);
  const [loading, setLoading] = useState(() => isUsingSupabaseProvider() && !(cached?.posts?.length > 0));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(() => cached?.error || "");
  const [saveError, setSaveError] = useState("");
  const postsRef = useRef(posts);
  const cachedRef = useRef(cached);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    cachedRef.current = cached;
  }, [cached]);

  const reload = useCallback(async () => {
    const hasCachedPosts = postsRef.current.length > 0 || (cachedRef.current?.posts?.length || 0) > 0;
    setError("");

    if (isUsingSupabaseProvider() && authLoading) {
      setLoading(!hasCachedPosts);
      setRefreshing(hasCachedPosts);
      return postsRef.current;
    }

    if (organizationOnly && isUsingSupabaseProvider() && usingSupabaseAuth && !hasActiveMembership) {
      setPosts([]);
      setLoading(false);
      setRefreshing(false);
      writeNewsCache(cacheKey, { posts: [], error: "", updatedAt: new Date().toISOString() });
      return [];
    }

    setLoading(!hasCachedPosts);
    setRefreshing(hasCachedPosts);

    try {
      const nextPosts = organizationOnly
        ? await dataProvider.getOrganizationNewsPosts()
        : await dataProvider.getNewsPosts();
      const normalizedPosts = nextPosts || [];
      setPosts(normalizedPosts);
      setError("");
      writeNewsCache(cacheKey, {
        posts: normalizedPosts,
        error: "",
        updatedAt: new Date().toISOString(),
      });
      return normalizedPosts;
    } catch (nextError) {
      console.error(nextError);
      setError(READ_ERROR);
      if (!hasCachedPosts) {
        setPosts([]);
      }
      return hasCachedPosts ? postsRef.current : [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    authLoading,
    cacheKey,
    hasActiveMembership,
    organizationOnly,
    usingSupabaseAuth,
  ]);

  useEffect(() => {
    if (cached?.posts) {
      setPosts(cached.posts);
    }
    if (cached?.error) {
      setError(cached.error);
    }
  }, [cached]);

  useEffect(() => {
    reload();
  }, [reload]);

  const createPost = useCallback(
    async (input) => {
      setSaveError("");
      if (!canPublishNews || (isUsingSupabaseProvider() && !hasActiveMembership)) {
        setSaveError("你当前没有发布机构动态权限。");
        throw new Error("Permission denied.");
      }
      try {
        const authorName = user?.name || String(user?.email || "").split("@")[0] || "";
        const saved = await dataProvider.createOrganizationNewsPost({ ...input, authorName });
        await reload();
        return saved;
      } catch (nextError) {
        console.error(nextError);
        setSaveError(SAVE_ERROR);
        throw nextError;
      }
    },
    [canPublishNews, hasActiveMembership, reload, user?.email, user?.name]
  );

  const updatePost = useCallback(
    async (id, input) => {
      setSaveError("");
      if (!canPublishNews || (isUsingSupabaseProvider() && !hasActiveMembership)) {
        setSaveError("你当前没有发布机构动态权限。");
        throw new Error("Permission denied.");
      }
      try {
        const saved = await dataProvider.updateOrganizationNewsPost(id, input);
        await reload();
        return saved;
      } catch (nextError) {
        console.error(nextError);
        setSaveError(SAVE_ERROR);
        throw nextError;
      }
    },
    [canPublishNews, hasActiveMembership, reload]
  );

  const archivePost = useCallback(
    async (id) => {
      setSaveError("");
      if (!canPublishNews || (isUsingSupabaseProvider() && !hasActiveMembership)) {
        setSaveError("你当前没有发布机构动态权限。");
        throw new Error("Permission denied.");
      }
      try {
        const saved = await dataProvider.archiveOrganizationNewsPost(id);
        await reload();
        return saved;
      } catch (nextError) {
        console.error(nextError);
        setSaveError(SAVE_ERROR);
        throw nextError;
      }
    },
    [canPublishNews, hasActiveMembership, reload]
  );

  return {
    posts,
    loading,
    refreshing,
    initialLoading: loading && !posts.length,
    error,
    saveError,
    reload,
    createPost,
    updatePost,
    archivePost,
  };
}
