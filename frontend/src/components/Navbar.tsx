import { BarChart3, Grid2X2, RadioTower, Route as RouteIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: Grid2X2 },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/predictions", label: "Predictions", icon: RadioTower },
  { to: "/patrol", label: "Patrol", icon: RouteIcon },
];

export default function Navbar() {
  // const footerName = isPatrol ? "Cmdr. Sterling" : isPredictions ? "Org Admin" : isAnalytics ? "Command Center 01" : "Admin Console";
  // const footerSubtitle = isPatrol ? "Sector Lead" : isPredictions ? "Metro Control Center" : isAnalytics ? "Super Admin" : "Active Session";

  return (
    <aside className="border-b border-[#1f2b3d] bg-[#111f2f] lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[260px] lg:flex-col lg:border-b-0 lg:border-r">
      <nav className="flex flex-col gap-5 px-4 py-4 sm:px-6 lg:h-full lg:px-0 lg:py-0">
        <div className="px-0 lg:px-6 lg:pt-8">
          <h1 className="text-[28px] font-black leading-none tracking-[-0.01em] text-[#dfeaff]">ParkSight AI</h1>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:mt-9 lg:flex-col lg:gap-3 lg:overflow-visible lg:pb-0">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-w-max items-center gap-4 border-l-4 px-5 py-4 text-lg font-bold text-[#cdd6e8] transition lg:mx-3 lg:min-w-0 lg:px-4 ${
                  isActive
                    ? "border-[#a8c4ff] bg-[#253751] text-[#c6d9ff]"
                    : "border-transparent hover:bg-[#18283c] hover:text-white"
                }`
              }
            >
              <Icon size={25} strokeWidth={2.4} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* <div className="mt-auto hidden border-t border-[#1f2b3d] px-[30px] py-6 lg:flex lg:items-center lg:gap-4">
          <div className={`${isPatrol || isPredictions ? "bg-[#4a89ff] text-[#061321]" : "border border-[#2b4b61] bg-[#0c2b3c] text-[#9ec8ff]"} grid h-12 w-12 place-items-center rounded-full`}>
            {isPredictions ? <span className="text-lg font-black">HQ</span> : <SquareActivity size={22} />}
          </div>
          <div>
            <p className={`${isPredictions || isAnalytics ? "font-sans tracking-normal" : "font-mono tracking-[0.08em]"} text-base font-bold text-[#e4ecfb]`}>{footerName}</p>
            <p className={`${isPatrol || isPredictions ? "font-sans text-sm normal-case tracking-normal" : "font-mono text-xs uppercase tracking-[0.18em]"} mt-1 text-[#c2cadb]`}>
              {footerSubtitle}
            </p>
          </div>
        </div> */}
      </nav>
    </aside>
  );
}
