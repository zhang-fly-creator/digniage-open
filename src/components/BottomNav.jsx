import { Home, ClipboardList, HeartHandshake, UserRound, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "首页", icon: Home },
  { to: "/elders", label: "长者", icon: Users },
  { to: "/opportunities", label: "机会", icon: HeartHandshake },
  { to: "/records", label: "记录", icon: ClipboardList },
  { to: "/my", label: "我的", icon: UserRound },
];

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pb-4 md:max-w-3xl xl:max-w-6xl">
      <div className="grid grid-cols-5 rounded-[28px] border border-white/70 bg-white/90 p-2 shadow-card backdrop-blur md:mx-auto md:max-w-2xl">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-xs font-semibold transition md:text-sm ${
                isActive ? "bg-app-orangeSoft text-app-ink" : "text-app-muted"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
