import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { hasPermission } from "../config/permissions";
import { isUsingSupabaseProvider } from "../services/dataProvider";
import {
  canEditElderSensitiveInfo as canEditSensitiveInfoByRole,
  canViewElderSensitiveInfo as canViewSensitiveInfoByRole,
} from "../utils/privacy";
import {
  getLocalAuthContext,
  getSupabaseAuthContext,
  onSupabaseAuthChange,
  signInWithEmail,
  signOutSupabase,
  signUpWithEmail,
} from "../services/authService";

const AuthContext = createContext(null);
const authCache = { value: null };

function buildPermissions(membership) {
  const active = membership?.status === "active";
  const role = membership?.role || "";
  const isOrgAdmin = active && role === "org_admin";
  const isStaff = active && role === "staff";
  const isVolunteer = active && role === "volunteer";
  const getPermission = (permissionKey) => active && hasPermission(role, permissionKey);

  return {
    isOrgAdmin,
    isStaff,
    isVolunteer,
    canEditOrganizationSettings: isOrgAdmin,
    canManageMembers: getPermission("canManageMembers"),
    canArchiveElders: getPermission("canArchiveElders"),
    canManageElders: getPermission("canArchiveElders"),
    canEditElders: getPermission("canEditElders"),
    canCloseOpportunities: getPermission("canCloseOpportunities"),
    canCompleteOpportunities: isOrgAdmin || isStaff,
    canAssignOpportunities: isOrgAdmin || isStaff,
    canCreateServiceOpportunities: isOrgAdmin || isStaff,
    canCreateServiceRecords: getPermission("canCreateServiceRecords"),
    canDeleteServiceRecords: getPermission("canDeleteServiceRecords"),
    canPublishNews: getPermission("canPublishNews"),
    canViewOrgDashboard: getPermission("canViewOrgDashboard"),
    canViewElderSensitiveInfo: active && canViewSensitiveInfoByRole(role),
    canEditElderSensitiveInfo: active && canEditSensitiveInfoByRole(role),
  };
}

function getCachedOrLocalAuthContext() {
  return authCache.value || getLocalAuthContext();
}

export function AuthProvider({ children }) {
  const usingSupabaseAuth = isUsingSupabaseProvider();
  const initialContext = getCachedOrLocalAuthContext();
  const [state, setState] = useState(() => ({
    ...initialContext,
    loading: usingSupabaseAuth && !Boolean(initialContext?.user?.id),
    refreshing: false,
    error: "",
  }));

  const reloadAuth = useCallback(async () => {
    if (!usingSupabaseAuth) {
      const nextLocal = getLocalAuthContext();
      authCache.value = nextLocal;
      setState({
        ...nextLocal,
        loading: false,
        refreshing: false,
        error: "",
      });
      return;
    }

    setState((previous) => ({
      ...previous,
      loading: !previous.user?.id,
      refreshing: Boolean(previous.user?.id),
      error: "",
    }));

    try {
      const next = await getSupabaseAuthContext();
      authCache.value = next;
      setState({
        ...next,
        loading: false,
        refreshing: false,
        error: "",
      });
    } catch (error) {
      console.error(error);
      setState((previous) => ({
        ...previous,
        loading: false,
        refreshing: false,
        error: "身份信息读取失败，请检查 Supabase Auth、profiles 或 organization_members 配置。",
      }));
    }
  }, [usingSupabaseAuth]);

  useEffect(() => {
    reloadAuth();
    if (!usingSupabaseAuth) return undefined;
    return onSupabaseAuthChange(reloadAuth);
  }, [reloadAuth, usingSupabaseAuth]);

  const signIn = useCallback(
    async ({ email, password }) => {
      await signInWithEmail(email, password);
      await reloadAuth();
    },
    [reloadAuth]
  );

  const signUp = useCallback(
    async ({ email, password, name }) => {
      await signUpWithEmail({ email, password, name });
      await reloadAuth();
    },
    [reloadAuth]
  );

  const signOut = useCallback(async () => {
    if (!usingSupabaseAuth) return;
    await signOutSupabase();
    authCache.value = null;
    await reloadAuth();
  }, [reloadAuth, usingSupabaseAuth]);

  const value = useMemo(() => {
    const permissions = buildPermissions(state.membership);
    const isAuthenticated = usingSupabaseAuth ? Boolean(state.user?.id) : true;
    const hasActiveMembership = usingSupabaseAuth ? state.membership?.status === "active" : true;

    return {
      ...state,
      ...permissions,
      usingSupabaseAuth,
      isAuthenticated,
      hasActiveMembership,
      initialLoading: state.loading && !state.user?.id,
      reloadAuth,
      signIn,
      signUp,
      signOut,
    };
  }, [reloadAuth, signIn, signOut, signUp, state, usingSupabaseAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthData() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthData must be used inside AuthProvider.");
  }
  return context;
}
