import {
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  Filter,
  MoreVertical,
  Search,
  Send,
  Settings,
  WandSparkles,
} from "lucide-react";

import { usePatrolRecommendations } from "../hooks/useApi";
import type { PatrolRecommendation } from "../types";

export default function Patrol() {
  const { data = [], isLoading } = usePatrolRecommendations();
  const activePatrols = data.length;
  const meanPriority = average(data.map((item) => item.priority_score));
  const meanRisk = average(data.map((item) => item.risk_score));
  const expectedViolations = data.reduce((sum, item) => sum + item.expected_violations, 0);
  const assignments = data.map(toAssignment);

  return (
    <div className="mx-auto max-w-[1220px] pb-12">
      <header className="-mx-4 -mt-5 mb-10 flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-[#152439] bg-[#061321] px-8 sm:-mx-6 lg:-mx-8">
        <div className="flex flex-wrap items-center gap-7">
          <h1 className="text-3xl font-black tracking-[-0.02em] text-[#e8f0ff]">Patrol Planner</h1>
        </div>

        <div className="flex flex-1 items-center justify-end gap-5">
          <label className="relative hidden w-full max-w-[320px] md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a7b3c7]" size={18} />
            <input
              className="h-12 w-full rounded-lg border border-[#20324a] bg-[#111f2f] pl-12 pr-4 text-[#dbe5f5] outline-none placeholder:text-[#8390a4] focus:border-[#9ebcff]"
              placeholder="Filter assignments..."
              type="search"
            />
          </label>

        </div>
      </header>

      <section className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
        <PlannerMetric label="Active Patrols" value={formatNumber(activePatrols)} detail={isLoading ? "Loading" : "Backend"} detailTone="neutral" />
        <PlannerMetric label="Mean Priority" value={formatPercent(meanPriority)} detail="Model score" detailTone="neutral" />
        <PlannerMetric label="Mean Risk" value={formatPercent(meanRisk)} detail="Hotspot score" detailTone="neutral" />
        <PlannerMetric label="Expected Violations" value={formatNumber(expectedViolations)} detail="Recommended zones" detailTone="neutral" emphasized />
      </section>

      <section className="mt-10 overflow-hidden rounded-xl border border-[#16283b] bg-[#111f2f] shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-8">
          <div>
            <h2 className="text-3xl font-medium tracking-[-0.02em] text-[#e8f0ff]">Recommended Patrol Assignments</h2>
            <p className="mt-1 text-lg text-[#d8dfed]">Real-time dynamic task allocation based on predictive risk modeling.</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-3 rounded-lg bg-[#2b3b52] px-5 py-3 text-lg font-bold text-[#dce6f7]" type="button">
              <Filter size={18} />
              Filter
            </button>
            <button className="inline-flex items-center gap-3 rounded-lg bg-[#a8c4ff] px-5 py-3 text-lg font-black text-[#102149] shadow-[0_14px_28px_rgba(95,128,200,0.3)]" type="button">
              <Send size={17} />
              Deploy All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] text-left">
            <thead className="bg-[#172638] font-mono text-sm uppercase tracking-[0.14em] text-[#d1dae9]">
              <tr>
                <th className="px-8 py-6">Officer ID</th>
                <th className="px-8 py-6">Assigned Area</th>
                <th className="px-8 py-6 text-center">Priority Score</th>
                <th className="px-8 py-6">Risk Level</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? (
                assignments.map((assignment, index) => (
                  <tr
                    key={assignment.officer}
                    className={`border-b border-[#172638] ${index < 2 ? "bg-[#141827]" : "bg-[#0d1d2d]"} ${index === 0 ? "border-l-4 border-l-[#ffaaa3]" : ""}`}
                  >
                    <td className="px-8 py-7 font-mono text-xl leading-8 tracking-[0.08em] text-[#e3ebfa]">
                      {assignment.officer.replace("-", "-\n").split("\n").map((line) => (
                        <span className="block" key={line}>{line}</span>
                      ))}
                    </td>
                    <td className="px-8 py-7">
                      <p className="max-w-[250px] text-2xl font-black leading-snug text-[#e8f0ff]">{assignment.area}</p>
                      <p className="mt-3 text-base text-[#c7cedd]">{assignment.zone}</p>
                    </td>
                    <td className="px-8 py-7 text-center">
                      <PriorityGauge value={assignment.priority} tone={assignment.riskTone} />
                    </td>
                    <td className="px-8 py-7">
                      <RiskBadge label={assignment.risk} tone={assignment.riskTone} />
                    </td>
                    <td className="px-8 py-7">
                      <StatusLabel label={assignment.status} tone={assignment.statusTone} />
                    </td>
                    <td className="px-8 py-7 text-right">
                      <button className="inline-grid h-10 w-10 place-items-center rounded-md text-[#cbd6e8] hover:bg-white/5" type="button" aria-label={`Actions for ${assignment.officer}`}>
                        <MoreVertical size={25} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-8 py-10 text-center text-[#d8dfed]" colSpan={6}>No patrol recommendations returned by the backend yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function toAssignment(recommendation: PatrolRecommendation) {
  const riskTone = riskToneFromScore(recommendation.risk_score);
  return {
    officer: recommendation.officer_id,
    area: recommendation.junction_name,
    zone: recommendation.assigned_h3_cell,
    priority: Math.round(recommendation.priority_score),
    risk: `${riskLabel(recommendation.risk_score)} - ${Math.round(recommendation.risk_score)}%`,
    riskTone,
    status: recommendation.status,
    statusTone: recommendation.status === "recommended" ? "scheduled" : "ready",
  };
}

function PlannerMetric({
  label,
  value,
  detail,
  detailTone,
  emphasized,
}: {
  label: string;
  value: string | number;
  detail: string;
  detailTone: "good" | "neutral";
  emphasized?: boolean;
}) {
  return (
    <article className={`rounded-xl border bg-[#111f2f] p-8 ${emphasized ? "border-[#466188]" : "border-[#20324a]"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-[#d1dae9]">{label}</p>
          <div className="mt-4 flex items-end gap-3">
            <strong className="text-4xl font-black uppercase leading-none tracking-[0.04em] text-[#dce8fb]">{value}</strong>
            {detail && <span className={detailTone === "good" ? "pb-1 text-sm font-bold text-[#4eff93]" : "pb-1 text-base text-[#d8dfed]"}>{detail}</span>}
          </div>
        </div>
        {emphasized && <WandSparkles className="mt-10 text-[#a8c4ff]" size={24} />}
      </div>
    </article>
  );
}

function PriorityGauge({ value, tone }: { value: number; tone: string }) {
  const color = tone === "elevated" ? "#ff7417" : tone === "moderate" ? "#ffd21e" : tone === "nominal" ? "#4add78" : "#ffaaa3";

  return (
    <div className="mx-auto w-[120px]">
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <div className="mt-3 h-2 rounded-full bg-[#2a3a4c]">
        <div className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function RiskBadge({ label, tone }: { label: string; tone: string }) {
  const classes = {
    critical: "bg-[#ffaaa3] text-[#5a1015]",
    high: "bg-[#ffaaa3] text-[#5a1015]",
    elevated: "bg-[#ff7417] text-white",
    moderate: "bg-[#ffd21e] text-[#101827]",
    nominal: "bg-[#4add78] text-[#09220f]",
  }[tone];

  return (
    <span className={`inline-flex min-w-[132px] items-center gap-3 rounded-full px-4 py-3 text-sm font-black uppercase ${classes}`}>
      <span className="h-2 w-2 rounded-full bg-white" />
      {label}
    </span>
  );
}

function StatusLabel({ label, tone }: { label: string; tone: string }) {
  const icon =
    tone === "alert" ? (
      <AlertTriangle className="text-[#c4192d]" size={27} />
    ) : tone === "scheduled" ? (
      <Clock3 className="text-[#d3dbea]" size={27} />
    ) : (
      <CheckCircle2 className="text-[#4eff93]" size={27} />
    );

  return (
    <span className="inline-flex max-w-[170px] items-center gap-3 text-lg text-[#e5ecf9]">
      {icon}
      {label}
    </span>
  );
}

function riskToneFromScore(score: number) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "elevated";
  if (score >= 20) return "moderate";
  return "nominal";
}

function riskLabel(score: number) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Elevated";
  if (score >= 20) return "Moderate";
  return "Nominal";
}

function average(values: number[]) {
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatPercent(value?: number) {
  return value === undefined ? "--" : `${Math.round(value)}%`;
}

function formatNumber(value?: number) {
  return value === undefined ? "--" : value.toLocaleString();
}
