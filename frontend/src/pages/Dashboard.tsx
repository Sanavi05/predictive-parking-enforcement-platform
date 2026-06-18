import {
  Bell,
  ChartNoAxesColumn,
  Flame,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  UserCircle2,
  Zap,
} from "lucide-react";

import MapView, { type MapMarker } from "../components/MapView";
import { useAnalytics, useDashboardSummary, useHotspots, usePatrolRecommendations } from "../hooks/useApi";
import type { Hotspot, PatrolRecommendation } from "../types";

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: hotspots = [], isLoading: hotspotsLoading } = useHotspots();
  const { data: patrolRecommendations = [] } = usePatrolRecommendations();

  const totalViolations = summary?.expected_violations_today ?? analytics?.total_violations;
  const congestion = summary?.average_congestion_score;
  const activeHotspots = summary ? summary.critical_zones + summary.high_risk_zones : undefined;
  const mapMarkers = hotspots.map(toMapMarker);
  const alerts = buildAlerts(hotspots);
  const forecastRows = hotspots.slice(0, 5).map((hotspot) => toForecastRow(hotspot, patrolRecommendations));
  const expectedImpact = average(patrolRecommendations.map((item) => item.expected_impact_reduction));
  const isLoading = analyticsLoading || summaryLoading || hotspotsLoading;

  return (
    <div className="mx-auto max-w-[1220px] pb-6">
      <section className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Total Violations" value={formatNumber(totalViolations)} delta={isLoading ? "Loading" : "Backend"} deltaTone="neutral" icon={<ShieldAlert size={17} />} />
        <MetricTile label="Active Hotspots" value={formatNumber(activeHotspots)} delta={summary ? `${summary.critical_zones} critical` : "Loading"} deltaTone="neutral" icon={<Flame size={17} />} />
        <MetricTile label="Avg Congestion" value={formatPercent(congestion)} delta={hotspots.length ? `${hotspots.length} zones` : "Loading"} deltaTone="neutral" icon={<ChartNoAxesColumn size={17} />} />
        <MetricTile label="Expected Impact" value={formatPercent(expectedImpact)} delta={patrolRecommendations.length ? "Patrol model" : "Loading"} deltaTone="neutral" icon={<Zap size={17} />} />
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        <MapView markers={mapMarkers} />

        <aside className="overflow-hidden rounded-lg border border-[#1d2b3d] bg-[#111a29]">
          <div className="flex items-center justify-between border-b border-[#1d2b3d] px-5 py-5">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-[#e8f0ff]">Critical Alerts</h2>
            <span className="rounded bg-[#312f3b] px-3 py-2 text-xs font-black uppercase text-[#ffb3a8]">Live</span>
          </div>
          <div className="space-y-3 p-3">
            {alerts.length > 0 ? alerts.map((alert, index) => (
              <article
                key={`${alert.title}-${index}`}
                className={`rounded-lg border p-4 ${
                  alert.tone === "high"
                    ? "border-[#684453] bg-[#1a2030]"
                    : alert.tone === "clear"
                      ? "border-transparent bg-[#141f2f]"
                      : "border-transparent bg-[#111b2a]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        alert.tone === "clear" ? "bg-[#42e777]" : alert.tone === "idle" ? "bg-[#93a0b7]" : "bg-[#ffaaa3]"
                      }`}
                    />
                    <h3 className="text-lg font-extrabold text-[#dfe8f8]">{alert.title}</h3>
                  </div>
                  <time className="shrink-0 text-xs text-[#c9d1df]">{alert.time}</time>
                </div>
                <p className="mt-4 pl-7 leading-7 text-[#d9deeb]">{alert.message}</p>
              </article>
            )) : <EmptyState message="No hotspot alerts returned by the backend yet." />}
          </div>
          <button className="w-full border-t border-[#1d2b3d] py-4 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#d6e3ff]" type="button">
            View System Logs
          </button>
        </aside>
      </section>

      <section className="mt-8 overflow-hidden rounded-lg border border-[#1d2b3d] bg-[#111a29]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-5">
          <h2 className="flex items-center gap-3 text-2xl font-black text-[#e8f0ff]">
            <ChartNoAxesColumn className="rounded bg-[#a9c7ff] p-1 text-[#0d1a2b]" size={25} />
            Top Hotspots Forecast
          </h2>
          <div className="flex gap-2">
            <button className="rounded-md border border-[#20324a] px-4 py-2 text-sm text-[#dfe8f8]" type="button">Daily</button>
            <button className="rounded-md bg-[#a9c7ff] px-4 py-2 text-sm font-bold text-[#0d1a2b]" type="button">Hourly</button>
          </div>
        </div>
        <div className="overflow-x-auto px-8 pb-6">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-[#26364a] font-mono text-sm uppercase tracking-[0.08em] text-[#d6deef]">
              <tr>
                <th className="px-3 py-4">Junction Name</th>
                <th className="px-3 py-4">Risk Level</th>
                <th className="px-3 py-4">Predicted Violations</th>
                <th className="px-3 py-4">Active Assets</th>
                <th className="px-3 py-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {forecastRows.length > 0 ? forecastRows.map((row, index) => (
                <tr key={`${row.name}-${index}`} className="border-b border-[#1b2738] last:border-0">
                  <td className="px-3 py-5 text-lg font-bold text-[#e5ecf9]">{row.name}</td>
                  <td className="px-3 py-5">
                    <span className={`rounded-md px-3 py-1 text-xs font-black uppercase ${row.risk === "Critical" ? "bg-[#be111d] text-[#ffe4e4]" : "bg-[#24304a] text-[#cddcff]"}`}>
                      {row.risk}
                    </span>
                  </td>
                  <td className="px-3 py-5 font-mono text-lg text-[#e5ecf9]">{row.violations}</td>
                  <td className="px-3 py-5 text-lg text-[#dbe3f2]">{row.assets}</td>
                  <td className={`px-3 py-5 text-right text-lg font-bold ${row.trendTone === "down" ? "text-[#42e777]" : "text-[#ffaaa3]"}`}>
                    <span className="inline-flex items-center gap-1">
                      {row.trendTone === "down" ? <TrendingDown size={17} /> : <TrendingUp size={17} />}
                      {row.trend}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-3 py-8 text-center text-[#dbe3f2]" colSpan={5}>No hotspot forecast data returned by the backend yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function buildAlerts(hotspots: Hotspot[]) {
  return hotspots.slice(0, 4).map((hotspot) => {
    const risk = riskFromScore(hotspot.risk_score);
    const violations = hotspot.predicted_violations ?? 0;
    const score = Math.round(hotspot.risk_score ?? 0);
    return {
      title: hotspot.zone_name ?? coordinateLabel(hotspot),
      time: "Backend",
      message: `${score}% risk score with ${violations.toLocaleString()} observed violations in the source data.`,
      tone: risk === "high" ? "high" : risk === "medium" ? "clear" : "idle",
    };
  });
}

function toForecastRow(hotspot: Hotspot, patrolRecommendations: PatrolRecommendation[]) {
  const riskScore = hotspot.risk_score ?? 0;
  const relatedPatrol = patrolRecommendations.find((item) => item.junction_name === hotspot.zone_name);
  const officers = relatedPatrol ? Math.max(1, Math.ceil(relatedPatrol.priority_score / 35)) : undefined;
  const trendTone = riskScore >= 60 ? "up" : "down";

  return {
    name: hotspot.zone_name ?? coordinateLabel(hotspot),
    risk: riskLabel(riskScore),
    violations: `${(hotspot.predicted_violations ?? 0).toLocaleString()} cases`,
    assets: officers ? `${officers} officers` : "Pending assignment",
    trend: `${Math.round(riskScore)}%`,
    trendTone,
  };
}

function toMapMarker(hotspot: Hotspot): MapMarker {
  const lat = hotspot.lat ?? hotspot.latitude ?? 0;
  const lng = hotspot.lng ?? hotspot.longitude ?? 0;
  const risk = hotspot.risk ?? riskFromScore(hotspot.risk_score);

  return { lat, lng, risk };
}

function riskLabel(score = 0) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function coordinateLabel(hotspot: Hotspot) {
  const lat = hotspot.lat ?? hotspot.latitude;
  const lng = hotspot.lng ?? hotspot.longitude;
  if (lat === undefined || lng === undefined) return "Unmapped zone";
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function average(values: number[]) {
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatNumber(value?: number) {
  return value === undefined ? "--" : value.toLocaleString();
}

function formatPercent(value?: number) {
  return value === undefined ? "--" : `${Math.round(value)}%`;
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-lg border border-[#26364a] bg-[#111b2a] p-4 text-[#d9deeb]">{message}</p>;
}

function riskFromScore(score = 0): MapMarker["risk"] {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function MetricTile({
  label,
  value,
  delta,
  deltaTone,
  icon,
}: {
  label: string;
  value: string | number;
  delta: string;
  deltaTone: "good" | "bad" | "neutral";
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-[#1e2b3d] bg-[#111a29] p-7 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm font-bold uppercase tracking-[0.14em] text-[#c7cedc]">{label}</p>
        <span className="text-[#8ea0bf]">{icon}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <strong className="text-4xl font-black leading-none tracking-[-0.03em] text-[#dce8fb]">{value}</strong>
        <span
          className={`font-mono text-sm font-black ${
            deltaTone === "good" ? "text-[#4eff93]" : deltaTone === "bad" ? "text-[#ffaaa3]" : "text-[#e2e8f6]"
          }`}
        >
          {delta}
          {deltaTone === "good" && <TrendingUp className="ml-1 inline" size={13} />}
          {deltaTone === "bad" && <TrendingDown className="ml-1 inline" size={13} />}
        </span>
      </div>
    </article>
  );
}
