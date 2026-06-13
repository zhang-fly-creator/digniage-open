import {
  Building2,
  ClipboardList,
  HeartHandshake,
  Home,
  Newspaper,
  Search,
  Settings,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthData } from "../hooks/useAuthData.jsx";
import { useOrganizationData } from "../hooks/useOrganizationData";

const sidebarItems = [
  { to: "/org", label: "首页", icon: Home, end: true },
  { to: "/org/elders", label: "长者档案", icon: Users },
  { to: "/org/news", label: "机构动态", icon: Newspaper },
  { to: "/org/opportunities", label: "服务机会", icon: HeartHandshake },
  { to: "/org/records", label: "服务记录", icon: ClipboardList },
  { to: "/org/my-service", label: "我的服务", icon: UserCheck },
  { to: "/my", label: "我的", icon: UserRound },
  { to: "/org/members", label: "成员管理", icon: Users, adminOnly: true },
  { to: "/org/settings", label: "机构设置", icon: Settings },
];

const mobileItems = [
  { to: "/org", label: "首页", icon: Home, end: true },
  { to: "/org/elders", label: "长者", icon: Users },
  { to: "/org/opportunities", label: "机会", icon: HeartHandshake },
  { to: "/org/records", label: "记录", icon: ClipboardList },
  { to: "/my", label: "我的", icon: UserRound },
];

const pageTitles = {
  "/org": "机构空间",
  "/org/elders": "长者档案",
  "/org/news": "机构动态",
  "/org/news/new": "发布机构动态",
  "/org/opportunities": "服务机会",
  "/org/opportunities/new": "新增服务提醒",
  "/org/records": "服务记录",
  "/org/my-service": "我的服务",
  "/org/members": "成员管理",
  "/org/settings": "机构设置",
};

function OrgNavLink({ item, compact = false }) {
  const { to, label, icon: Icon, end } = item;

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        compact
          ? `flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-xs font-semibold transition ${
              isActive ? "bg-app-orangeSoft text-app-ink" : "text-app-muted"
            }`
          : `flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-extrabold transition ${
              isActive ? "bg-app-orangeSoft text-app-orange" : "text-app-muted hover:bg-app-cream"
            }`
      }
    >
      <Icon size={compact ? 18 : 20} />
      <span>{label}</span>
    </NavLink>
  );
}

function OrgLayout() {
  const location = useLocation();
  const { organization } = useOrganizationData();
  const { user, membership, canManageMembers } = useAuthData();
  const title =
    pageTitles[location.pathname] ||
    (location.pathname.includes("/org/news/") && location.pathname.includes("/edit")
      ? "编辑机构动态"
      : "机构空间");
  const organizationName = organization?.name || "机构空间";

  return (
    <div className="min-h-screen bg-app-cream text-app-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-app-line bg-app-white/95 p-5 shadow-sm backdrop-blur lg:block">
        <div className="rounded-[28px] bg-app-orangeSoft p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-orange text-white">
            <Building2 size={24} />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">知老</h1>
          <p className="mt-1 text-base font-extrabold text-app-orange">机构空间</p>
          <p className="mt-2 text-sm font-bold text-app-muted">
            当前机构：{organizationName}
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {sidebarItems
            .filter((item) => !item.adminOnly || canManageMembers)
            .map((item) => (
              <OrgNavLink key={item.to} item={item} />
            ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 px-4 pt-4 lg:px-8">
          <div className="rounded-[28px] border border-white/60 bg-white/75 px-5 py-4 shadow-sm backdrop-blur lg:flex lg:items-center lg:justify-between lg:gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">
                ZhiLao
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">{title}</h2>
              <p className="mt-1 text-sm font-bold text-app-muted">
                当前机构：{organizationName}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:mt-0 lg:min-w-[420px] lg:flex-row lg:items-center lg:justify-end">
              <label className="hidden min-w-0 flex-1 items-center gap-2 rounded-2xl border border-app-line bg-app-cream px-4 py-3 lg:flex">
                <Search size={18} className="shrink-0 text-app-muted" />
                <input
                  className="border-0 bg-transparent p-0 text-sm shadow-none outline-none focus:border-0 focus:ring-0"
                  placeholder="搜索长者、服务记录等"
                />
              </label>
              <div className="hidden shrink-0 text-right lg:block">
                <p className="text-base font-extrabold text-app-ink">{user?.name || "未登录"}</p>
                <p className="mt-1 text-sm font-bold text-app-orange">
                  {membership?.roleName || "尚未加入机构"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pb-4 lg:hidden">
        <div className="grid grid-cols-5 rounded-[28px] border border-white/70 bg-white/90 p-2 shadow-card backdrop-blur">
          {mobileItems.map((item) => (
            <OrgNavLink key={item.to} item={item} compact />
          ))}
        </div>
      </nav>
    </div>
  );
}

export default OrgLayout;
