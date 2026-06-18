import { useState } from "react";

import type { Hotspot } from "../types";

function riskColor(score: number) {
  if (score < 30) return "#22c55e";
  if (score < 60) return "#facc15";
  if (score < 80) return "#f97316";
  return "#ef4444";
}

export default function MapView({ hotspots }: { hotspots: Hotspot[] }) {
  const [selected, setSelected] = useState<Hotspot | undefined>(hotspots[0]);
  const activeHotspot = selected ?? hotspots[0];

  return (
    <section className="panel relative min-h-[420px] overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(32,211,162,0.18),transparent_30%),linear-gradient(135deg,#111827,#0f172a_45%,#111827)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Bengaluru Hotspot Map</h2>
          <span className="rounded bg-slate-950/70 px-2 py-1 text-xs text-slate-300">Live risk zones</span>
        </div>
        <div className="relative flex-1 rounded-lg border border-line bg-slate-950/50">
          {hotspots.map((hotspot, index) => (
            <button
              key={`${hotspot.latitude}-${hotspot.longitude}`}
              type="button"
              className="absolute h-5 w-5 rounded-full border-2 border-white/70 transition-transform hover:scale-125"
              style={{
                left: `${18 + ((index * 17) % 64)}%`,
                top: `${22 + ((index * 13) % 52)}%`,
                background: riskColor(hotspot.risk_score),
                boxShadow: "0 0 28px currentColor",
              }}
              onClick={() => setSelected(hotspot)}
              title={`Risk ${hotspot.risk_score}`}
            />
          ))}
          {activeHotspot && (
            <div className="absolute bottom-4 left-4 w-[min(280px,calc(100%-2rem))] rounded-lg border border-line bg-slate-950/90 p-4 shadow-glow">
              <p className="text-sm font-semibold">
                {activeHotspot.zone_name ?? `Zone ${activeHotspot.latitude.toFixed(3)}, ${activeHotspot.longitude.toFixed(3)}`}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-400">Violations</dt>
                  <dd className="font-semibold">{activeHotspot.predicted_violations ?? "--"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Risk</dt>
                  <dd className="font-semibold">{activeHotspot.risk_score}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Congestion</dt>
                  <dd className="font-semibold">{activeHotspot.congestion_score ?? "--"}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Resources</dt>
                  <dd className="font-semibold">
                    {activeHotspot.recommended_officers ?? "--"} / {activeHotspot.recommended_tow_trucks ?? "--"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
