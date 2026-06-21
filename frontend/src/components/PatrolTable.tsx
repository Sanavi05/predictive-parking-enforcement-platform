import { MapPin, Route, ShieldCheck } from "lucide-react";
import type { PatrolRecommendation } from "../types";

export default function PatrolTable({
  recommendations,
}: {
  recommendations: PatrolRecommendation[];
}) {
  if (!recommendations.length) {
    return (
      <div className="rounded-xl border border-[#1d2b3d] bg-[#111a29] p-6 text-[#d9deeb]">
        No patrol recommendations available.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1d2b3d] bg-[#111a29]">
      <div className="flex items-center gap-3 border-b border-[#1d2b3d] px-6 py-5">
        <Route className="text-[#8fd7ff]" size={24} />
        <div>
          <h2 className="text-2xl font-black text-[#e8f0ff]">
            Patrol Route Optimization
          </h2>
          <p className="text-sm text-[#9aa8bd]">
            Greedy route planning across high-priority parking hotspots
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {recommendations.map((item) => {
          const route = item.route ?? [];

          return (
            <article
              key={item.officer_id}
              className="rounded-xl border border-[#26364a] bg-[#0d1624] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-[#8fd7ff]" size={20} />
                    <h3 className="text-xl font-black text-[#e8f0ff]">
                      {item.officer_id}
                    </h3>
                  </div>

                  <p className="mt-2 text-sm text-[#aab6c9]">
                    Priority Score:{" "}
                    <span className="font-bold text-[#e8f0ff]">
                      {item.priority_score.toFixed(1)}
                    </span>
                  </p>
                </div>

                <div className="rounded-lg bg-[#18263a] px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#9aa8bd]">
                    Expected Violations
                  </p>
                  <p className="text-2xl font-black text-[#e8f0ff]">
                    {item.expected_violations.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-[#24344a] bg-[#101b2b] p-4">
                <p className="mb-4 flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.08em] text-[#b8c7df]">
                  <MapPin size={16} />
                  Optimized Patrol Route
                </p>

                {route.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {route.map((stop, index) => (
                      <div
                        key={`${item.officer_id}-${stop.sequence}-${stop.junction_name}`}
                        className="flex items-center gap-3"
                      >
                        <div className="rounded-lg border border-[#334761] bg-[#162337] px-4 py-3">
                          <p className="text-xs font-bold text-[#8fd7ff]">
                            Stop {stop.sequence}
                          </p>
                          <p className="mt-1 max-w-[220px] truncate text-sm font-bold text-[#e8f0ff]">
                            {stop.junction_name || "Unknown Zone"}
                          </p>
                          <p className="mt-1 text-xs text-[#9aa8bd]">
                            Risk {Math.round(stop.risk_score)}% · Impact{" "}
                            {Math.round(stop.congestion_impact)}%
                          </p>
                        </div>

                        {index < route.length - 1 && (
                          <span className="text-xl font-black text-[#8fd7ff]">
                            →
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#d9deeb]">
                    {item.route_summary ?? item.junction_name}
                  </p>
                )}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <MiniStat label="Risk Score" value={`${Math.round(item.risk_score)}%`} />
                <MiniStat
                  label="Congestion Impact"
                  value={`${Math.round(item.congestion_impact)}%`}
                />
                <MiniStat
                  label="Impact Reduction"
                  value={`${Math.round(item.expected_impact_reduction)}%`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#162337] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.1em] text-[#8c9bb1]">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-[#e8f0ff]">{value}</p>
    </div>
  );
}