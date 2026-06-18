import {
  BarChart3,
  Bell,
  Download,
  Filter,
  UserCircle2,
} from "lucide-react";

import { useAnalytics, usePatrolRecommendations } from "../hooks/useApi";
import type { CountBucket } from "../types";

const heatHours = Array.from({ length: 24 }, (_, hour) => hour.toString().padStart(2, "0"));

export default function Analytics() {
  const { data, isLoading } = useAnalytics();
  const { data: patrolRecommendations = [] } = usePatrolRecommendations();
  const totalViolations = data?.total_violations;
  const hourlyBuckets = normalizeHourlyBuckets(data?.violations_by_hour ?? []);
  const trendPoints = buildTrendPoints(hourlyBuckets);
  const vehicleProfiles = buildProfiles(data?.violations_by_vehicle_type ?? []);
  const precincts = data?.top_police_stations ?? [];
  const topVehicle = vehicleProfiles[0];
  const busiestHour = [...hourlyBuckets].sort((a, b) => b.count - a.count)[0];
  const activePatrols = patrolRecommendations.length;

  return (
    <div className="mx-auto max-w-[1040px] pb-10">

      <section className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-lg font-medium text-[#f0f5ff]">Enforcement Analytics</h1>
          <p className="mt-3 max-w-[720px] text-lg leading-7 text-[#dce3f0]">
            A comprehensive breakdown of backend parking compliance, violation trends, and strategic resource allocation metrics.
          </p>
        </div>
        {/* <div className="flex gap-3">
          <button className="inline-flex items-center gap-4 rounded-lg border border-[#38506f] bg-[#071321] px-6 py-4 text-lg font-bold text-[#e5ecf9]" type="button">
            <Filter size={18} />
            Filter<br />View
          </button>
          <button className="inline-flex items-center gap-4 rounded-lg bg-[#a8c4ff] px-6 py-4 text-lg font-black text-[#102149]" type="button">
            <Download size={18} />
            Export<br />PDF
          </button>
        </div> */}
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetric label="Total Violations" value={formatNumber(totalViolations)} delta={isLoading ? "Loading" : "Backend"} tone="neutral" fill={percentOf(totalViolations, totalViolations)} />
        <AnalyticsMetric label="Busiest Hour" value={busiestHour ? `${busiestHour.label}:00` : "--"} delta={busiestHour ? `${busiestHour.count.toLocaleString()} cases` : "No data"} tone="neutral" fill={percentOf(busiestHour?.count, maxCount(hourlyBuckets))} />
        <AnalyticsMetric label="Top Vehicle Type" value={topVehicle?.label ?? "--"} delta={topVehicle ? topVehicle.value : "No data"} tone="neutral" fill={topVehicle?.width ?? "0%"} />
        <AnalyticsMetric label="Active Patrols" value={formatNumber(activePatrols)} delta={activePatrols ? "Recommendations" : "No patrol data"} tone="neutral" fill={percentOf(activePatrols, activePatrols)} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <article className="rounded-xl border border-[#172638] bg-[#111f2f] p-6">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#f0f5ff]">Violations Temporal Trend</h2>
            <span className="rounded bg-[#25395a] px-3 py-1 font-mono text-xs font-black uppercase text-[#bcd0ff]">Real-Time</span>
          </div>
          <div className="relative h-[300px]">
            <div className="absolute inset-y-5 left-0 flex flex-col justify-between font-mono text-[10px] text-[#8d9bb0]">
              <span>{maxCount(hourlyBuckets).toLocaleString()}</span>
              <span>{Math.round(maxCount(hourlyBuckets) * 0.75).toLocaleString()}</span>
              <span>{Math.round(maxCount(hourlyBuckets) * 0.5).toLocaleString()}</span>
              <span>{Math.round(maxCount(hourlyBuckets) * 0.25).toLocaleString()}</span>
              <span>0</span>
            </div>
            <svg className="absolute inset-x-8 top-2 h-[235px] w-[calc(100%-4rem)] overflow-visible" viewBox="0 -20 640 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4679d9" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#0d1f33" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <polygon points={`0,220 ${trendPoints} 640,220`} fill="url(#trendFill)" />
              <polyline points={trendPoints} fill="none" stroke="#a8c4ff" strokeWidth="3" />
            </svg>
            <div className="absolute bottom-0 left-16 right-6 flex justify-between font-mono text-[10px] uppercase text-[#8d9bb0]">
              {hourlyBuckets.filter((_, index) => index % 6 === 0).map((bucket) => <span key={bucket.label}>{bucket.label}:00</span>)}
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-[#172638] bg-[#111f2f] p-6">
          <h2 className="mb-8 text-lg font-black text-[#f0f5ff]">Violation Composition</h2>
          <div className="mx-auto grid h-[190px] w-[190px] place-items-center rounded-full" style={{ background: compositionGradient(vehicleProfiles) }}>
            <div className="grid h-[112px] w-[112px] place-items-center rounded-full bg-[#081522] text-center">
              <strong className="text-xl text-[#f0f5ff]">{formatNumber(totalViolations)}</strong>
              <span className="block text-[10px] uppercase text-[#9ca8bb]">Total</span>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 text-xs text-[#dce3f0]">
            {vehicleProfiles.slice(0, 4).map((profile) => (
              <Legend key={profile.label} color={profile.color} label={`${profile.label} (${profile.share}%)`} />
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-xl border border-[#172638] bg-[#111f2f] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#f0f5ff]">Violation Density Heatmap</h2>
            <p className="mt-1 text-lg text-[#dce3f0]">Analysis of backend peak infraction hours.</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#b7c2d3]">
            Low
            <span className="h-3 w-3 rounded-sm bg-[#22344b]" />
            <span className="h-3 w-3 rounded-sm bg-[#425d88]" />
            <span className="h-3 w-3 rounded-sm bg-[#819ed3]" />
            <span className="h-3 w-3 rounded-sm bg-[#bcd0ff]" />
            High
          </div>
        </div>
        <div className="mt-8 grid grid-cols-[60px_1fr] gap-4">
          <div className="grid grid-rows-3 gap-1 py-1 font-mono text-[10px] text-[#b7c2d3]">
            {data?.peak_periods.map((row) => (
              <span key={row} className="h-7 flex items-center">{row}</span>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid max-w-[520px] grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
              {(data?.peak_periods ?? []).flatMap((row) =>
                heatHours.map((hour, hourIndex) => {
                  const source = hourlyBuckets[hourIndex]?.count ?? 0;
                  const intensity = maxCount(hourlyBuckets) ? source / maxCount(hourlyBuckets) : 0;
                  const color = intensity > 0.75 ? "#bcd0ff" : intensity > 0.5 ? "#819ed3" : intensity > 0.25 ? "#425d88" : "#14263a";
                  return <span key={`${row}-${hour}`} className="h-7 rounded-sm" style={{ backgroundColor: color, opacity: intensity > 0.25 ? 0.9 : 0.35 }} />;
                }),
              )}
            </div>
            <div className="grid max-w-[520px] grid-cols-[repeat(24,minmax(0,1fr))] gap-1 font-mono text-[9px] text-[#b7c2d3] text-center">
              {heatHours.map((hour) => (
                <span key={hour}>{hour}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[390px_1fr]">
        <article className="rounded-xl border border-[#172638] bg-[#111f2f] p-6">
          <h2 className="mb-8 text-lg font-black text-[#f0f5ff]">Offending Vehicle Profile</h2>
          <div className="space-y-5">
            {vehicleProfiles.map((profile) => (
              <div key={profile.label}>
                <div className="mb-2 flex justify-between gap-4 text-lg text-[#f0f5ff]">
                  <span>{profile.label}</span>
                  <span className="font-mono">{profile.value}</span>
                </div>
                <div className="h-2 rounded-full bg-[#2a3a4c]">
                  <div className="h-2 rounded-full bg-[#a8c4ff]" style={{ width: profile.width }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-[260px] text-xs italic text-[#f0f5ff]">Vehicle counts are grouped from backend violation records.</p>
        </article>

        <article className="overflow-hidden rounded-xl border border-[#172638] bg-[#111f2f]">
          <h2 className="px-6 py-6 text-lg font-black text-[#f0f5ff]">Precinct Performance Ranking</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-[#223247] font-mono text-[10px] uppercase tracking-[0.18em] text-[#aeb9ca]">
                <tr>
                  <th className="px-6 py-4">Station / Precinct</th>
                  <th className="px-6 py-4">Share</th>
                  <th className="px-6 py-4">Citations</th>
                  <th className="px-6 py-4">Total Share</th>
                </tr>
              </thead>
              <tbody>
              {precincts.map((precinct, index) => (
                  <tr key={precinct.label} className="border-b border-[#172638] last:border-0">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <span className={`${index === 0 ? "bg-[#5598ff]" : "bg-[#34445a]"} grid h-8 w-8 place-items-center rounded-lg text-xs font-black text-white`}>{index + 1}</span>
                        <div>
                          <p className="max-w-[160px] text-lg font-black leading-tight text-[#f0f5ff]">{precinct.label}</p>
                          <p className="mt-1 text-xs text-[#b7c2d3]">Backend ranking</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-lg text-[#f0f5ff]">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#4eff93]" />
                      {percentOf(precinct.count, maxCount(precincts))}
                    </td>
                    <td className="px-6 py-5 font-mono text-lg text-[#f0f5ff]">{precinct.count.toLocaleString()}</td>
                    <td className="px-6 py-5 font-mono text-lg text-[#f0f5ff]">{Math.round((precinct.count / Math.max(totalViolations ?? 1, 1)) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

function AnalyticsMetric({
  label,
  value,
  delta,
  tone,
  fill,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "good" | "bad" | "neutral";
  fill: string;
}) {
  const bar = tone === "bad" ? "#ffaaa3" : tone === "good" ? "#4eff93" : "#9aa8bc";

  return (
    <article className="rounded-xl border border-[#172638] bg-[#111f2f] p-6">
      <p className="text-base text-[#f0f5ff]">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <strong className="font-mono text-4xl leading-none tracking-[0.04em] text-[#e5ecf9]">{value}</strong>
        <span className={`pb-1 text-sm font-black ${tone === "bad" ? "text-[#ffaaa3]" : tone === "good" ? "text-[#4eff93]" : "text-[#dce3f0]"}`}>{delta}</span>
      </div>
      <div className="mt-5 h-1 rounded-full bg-[#2a3a4c]">
        <div className="h-1 rounded-full" style={{ width: fill, backgroundColor: bar }} />
      </div>
    </article>
  );
}

function normalizeHourlyBuckets(buckets: CountBucket[]) {
  const counts = new Map(buckets.map((bucket) => [Number(bucket.label), bucket.count]));
  return heatHours.map((hour) => ({ label: hour, count: counts.get(Number(hour)) ?? 0 }));
}

function buildTrendPoints(buckets: CountBucket[]) {
  const max = maxCount(buckets) || 1;
  return buckets
    .map((bucket, index) => {
      const x = buckets.length <= 1 ? 0 : (index / (buckets.length - 1)) * 640;
      const y = 200 - (bucket.count / max) * 190;
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(" ");
}

function buildProfiles(buckets: CountBucket[]) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const max = maxCount(buckets) || 1;
  return buckets.map((bucket, index) => {
    const share = total ? Math.round((bucket.count / total) * 100) : 0;
    return {
      label: bucket.label,
      value: bucket.count.toLocaleString(),
      width: `${Math.round((bucket.count / max) * 100)}%`,
      share,
      color: ["#5598ff", "#4add78", "#ffaaa3", "#819ed3"][index % 4],
      count: bucket.count,
    };
  });
}

function compositionGradient(profiles: ReturnType<typeof buildProfiles>) {
  if (!profiles.length) return "#27364a";
  let cursor = 0;
  const stops = profiles.slice(0, 4).map((profile) => {
    const start = cursor;
    cursor += profile.share;
    return `${profile.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function maxCount(buckets: CountBucket[]) {
  return Math.max(0, ...buckets.map((bucket) => bucket.count));
}

function percentOf(value?: number, max?: number) {
  if (!value || !max) return "0%";
  return `${Math.round((value / max) * 100)}%`;
}

function formatNumber(value?: number) {
  return value === undefined ? "--" : value.toLocaleString();
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-start gap-2">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
