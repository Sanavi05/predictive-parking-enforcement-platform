import type { Hotspot } from "../types";

export default function HeatMap({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <section className="panel p-4">
      <h2 className="mb-3 text-base font-semibold">Top Hotspots</h2>
      <div className="space-y-3">
        {hotspots.slice(0, 10).map((hotspot, index) => (
          <div key={`${hotspot.lat ?? hotspot.latitude}-${hotspot.lng ?? hotspot.longitude}`} className="rounded-lg bg-slate-950/45 p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>Zone {index + 1}</span>
              <strong>{hotspot.risk_score ?? hotspot.risk ?? "--"}</strong>
            </div>
            <div className="mt-2 h-2 rounded bg-slate-800">
              <div className="h-2 rounded bg-red-500" style={{ width: `${hotspot.risk_score ?? 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
