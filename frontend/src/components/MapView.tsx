import type { Hotspot } from "../types";

export default function MapView({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <section className="panel relative min-h-[420px] overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(32,211,162,0.18),transparent_30%),linear-gradient(135deg,#111827,#0f172a_45%,#111827)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Bengaluru Hotspot Map</h2>
          <span className="rounded bg-slate-950/70 px-2 py-1 text-xs text-slate-300">Mock map layer</span>
        </div>
        <div className="relative flex-1 rounded-lg border border-line bg-slate-950/50">
          {hotspots.map((hotspot, index) => (
            <div
              key={`${hotspot.latitude}-${hotspot.longitude}`}
              className="absolute h-5 w-5 rounded-full border-2 border-white/70"
              style={{
                left: `${18 + ((index * 17) % 64)}%`,
                top: `${22 + ((index * 13) % 52)}%`,
                background: hotspot.risk_score > 85 ? "#ef4444" : hotspot.risk_score > 70 ? "#f97316" : "#facc15",
                boxShadow: "0 0 28px currentColor",
              }}
              title={`Risk ${hotspot.risk_score}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
