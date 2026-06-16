import { Activity, BarChart3, Map, Route as RouteIcon, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: Map },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/predictions", label: "Predictions", icon: Activity },
  { to: "/patrol", label: "Patrol", icon: RouteIcon },
];

export default function Navbar() {
  return (
    <header className="border-b border-line bg-slate-950/90">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-signal/15 text-signal">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">ParkSight AI</h1>
            <p className="text-xs text-slate-400">Bengaluru parking intelligence</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? "bg-signal text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
