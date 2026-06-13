import { Navigate, Outlet } from "react-router-dom";
import { useAuthData } from "../hooks/useAuthData.jsx";
import PermissionDenied from "./PermissionDenied";

export function RequireAuth() {
  const { usingSupabaseAuth, isAuthenticated, initialLoading } = useAuthData();

  if (usingSupabaseAuth && initialLoading) {
    return (
      <section className="rounded-[30px] bg-app-white p-5 shadow-card">
        <p className="text-base font-bold leading-7 text-app-ink">正在读取登录状态...</p>
      </section>
    );
  }

  if (usingSupabaseAuth && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

export function RequireActiveMembership() {
  const { usingSupabaseAuth, isAuthenticated, hasActiveMembership } = useAuthData();

  if (usingSupabaseAuth && isAuthenticated && !hasActiveMembership) {
    return (
      <PermissionDenied
        title="尚未加入机构"
        description="当前账号尚未加入机构或成员身份不可用，请联系机构管理员。"
      />
    );
  }

  return <Outlet />;
}

export function RequirePermission({ children, permissionKey, title = "暂无权限", description }) {
  const auth = useAuthData();

  if (!auth[permissionKey]) {
    return <PermissionDenied title={title} description={description} />;
  }

  return children || <Outlet />;
}
