import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

const pageTitles = {
  "/": "首页",
  "/about": "知老项目详细介绍",
  "/founder": "发起人介绍",
  "/organization-partner": "机构指南",
  "/staff-guide": "服务人员使用指南",
  "/volunteer": "志愿者指南",
  "/elders": "长者",
  "/elders/new": "新建知老卡",
  "/opportunities": "服务机会",
  "/opportunities/new": "新增服务提醒",
  "/news": "知老动态",
  "/records": "服务记录",
  "/my-service": "我的服务",
  "/members": "成员管理",
  "/my": "我的",
  "/my/organization-settings": "机构设置",
  "/my/privacy": "隐私与使用边界",
  "/my/about": "关于知老",
  "/dev/supabase-test": "Supabase 测试",
};

function AppLayout() {
  const location = useLocation();
  const title =
    pageTitles[location.pathname] ||
    (location.pathname.includes("/news/")
      ? "动态详情"
      : location.pathname.includes("/edit")
      ? "编辑知老卡"
      : location.pathname.includes("/opportunities/")
        ? "服务机会详情"
        : location.pathname.includes("/elders/")
          ? "知老卡详情"
          : "知老");
  const isHome = location.pathname === "/";

  return (
    <div className={`app-shell ${isHome ? "bg-app-cream" : ""}`}>
      {!isHome ? (
        <header className="sticky top-0 z-20 px-4 pt-4">
          <div className="rounded-[28px] border border-white/60 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">
              ZhiLao
            </p>
            <h1 className="mt-2 text-2xl font-extrabold">{title}</h1>
          </div>
        </header>
      ) : null}

      <main className={`px-4 pb-8 ${isHome ? "pt-5" : "pt-4"}`}>
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}

export default AppLayout;
