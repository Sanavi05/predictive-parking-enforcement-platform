import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  MoreVertical,
  Route,
  Search,
  Send,
  WandSparkles,
} from "lucide-react";

import { usePatrolRecommendations } from "../hooks/useApi";
import type { PatrolRecommendation, PatrolRouteStop } from "../types";

export default function Patrol() {
  const { data = [], isLoading } = usePatrolRecommendations();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AssignmentStatus>>({});

  const activePatrols = data.length;
  const meanPriority = average(data.map((item) => item.priority_score));
  const meanRisk = average(data.map((item) => item.risk_score));
  const expectedViolations = data.reduce((sum, item) => sum + item.expected_violations, 0);

  const assignments = useMemo(
    () => data.map((item) => toAssignment(item, statusOverrides[item.officer_id])),
    [data, statusOverrides],
  );

  const visibleAssignments = assignments.filter((assignment) => {
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !query ||
      assignment.officer.toLowerCase().includes(query) ||
      assignment.area.toLowerCase().includes(query) ||
      assignment.zone.toLowerCase().includes(query) ||
      assignment.routeSummary.toLowerCase().includes(query);

    const matchesRisk = riskFilter === "all" || assignment.riskTone === riskFilter;
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  function updateStatus(officer: string, status: AssignmentStatus) {
    setStatusOverrides((current) => ({ ...current, [officer]: status }));
    setOpenActionMenu(null);
  }

  function deployVisibleAssignments() {
    setStatusOverrides((current) => {
      const next = { ...current };
      visibleAssignments.forEach((assignment) => {
        if (assignment.status !== "completed") next[assignment.officer] = "deployed";
      });
      return next;
    });
    setOpenActionMenu(null);
  }

  return (
    <div className="mx-auto max-w-[1220px] pb-12">
      <header className="-mx-4 -mt-5 mb-10 flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-[#152439] bg-[#061321] px-8 sm:-mx-6 lg:-mx-8">
        <div className="flex flex-wrap items-center gap-7">
          <h1 className="text-3xl font-black tracking-[-0.02em] text-[#e8f0ff]">
            Patrol Planner
          </h1>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <PlannerMetric
          label="Active Patrols"
          value={formatNumber(activePatrols)}
          detail={isLoading ? "Loading" : "Backend"}
          detailTone="neutral"
        />
        <PlannerMetric
          label="Mean Priority"
          value={formatPercent(meanPriority)}
          detail="Route score"
          detailTone="neutral"
        />
        <PlannerMetric
          label="Mean Risk"
          value={formatPercent(meanRisk)}
          detail="Hotspot score"
          detailTone="neutral"
        />
        <PlannerMetric
          label="Expected Violations"
          value={formatNumber(expectedViolations)}
          detail="Route zones"
          detailTone="neutral"
          emphasized
        />
      </section>

      <section className="mt-10 overflow-hidden rounded-xl border border-[#16283b] bg-[#111f2f] shadow-[0_22px_70px_rgba(0,0,0,0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-8">
          <div>
            <h2 className="text-3xl font-medium tracking-[-0.02em] text-[#e8f0ff]">
              Recommended Patrol Routes
            </h2>
            <p className="mt-1 text-lg text-[#d8dfed]">
              Multi-stop officer routes generated from hotspot priority and zone proximity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className={`inline-flex items-center gap-3 rounded-lg px-5 py-3 text-lg font-bold text-[#dce6f7] ${
                filtersOpen ? "bg-[#3b5272]" : "bg-[#2b3b52]"
              }`}
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-pressed={filtersOpen}
            >
              <Filter size={18} />
              Filter
            </button>

            <button
              className="inline-flex items-center gap-3 rounded-lg bg-[#a8c4ff] px-5 py-3 text-lg font-black text-[#102149] shadow-[0_14px_28px_rgba(95,128,200,0.3)] disabled:cursor-not-allowed disabled:opacity-55"
              type="button"
              onClick={deployVisibleAssignments}
              disabled={!visibleAssignments.length}
            >
              <Send size={17} />
              Deploy All
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="grid gap-4 border-t border-[#16283b] bg-[#0d1d2d] px-8 py-5 md:grid-cols-[minmax(220px,1fr)_190px_190px_auto]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a7b3c7]" size={18} />
              <input
                className="h-12 w-full rounded-lg border border-[#20324a] bg-[#111f2f] pl-12 pr-4 text-[#dbe5f5] outline-none placeholder:text-[#8390a4] focus:border-[#9ebcff]"
                placeholder="Search officer, area, or route..."
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <select
              className="h-12 rounded-lg border border-[#20324a] bg-[#111f2f] px-4 font-mono text-sm font-bold uppercase text-[#dbe5f5] outline-none focus:border-[#9ebcff]"
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
              aria-label="Filter by risk"
            >
              <option value="all">All risks</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="elevated">Elevated</option>
              <option value="moderate">Moderate</option>
              <option value="nominal">Nominal</option>
            </select>

            <select
              className="h-12 rounded-lg border border-[#20324a] bg-[#111f2f] px-4 font-mono text-sm font-bold uppercase text-[#dbe5f5] outline-none focus:border-[#9ebcff]"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All status</option>
              <option value="recommended">Pending deploy</option>
              <option value="deployed">Deployed</option>
              <option value="completed">Completed</option>
            </select>

            <button
              className="rounded-lg border border-[#2c405c] px-4 font-mono text-sm font-black uppercase text-[#dbe5f5]"
              type="button"
              onClick={() => {
                setSearchTerm("");
                setRiskFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear
            </button>
          </div>
        )}

        <div className="overflow-hidden">
          <table className="w-full table-fixed text-left">
            <thead className="bg-[#172638] font-mono text-xs uppercase tracking-[0.08em] text-[#d1dae9]">
              <tr>
                <th className="w-[14%] px-4 py-5">Officer ID</th>
                <th className="w-[38%] px-4 py-5">Optimized Route</th>
                <th className="w-[14%] px-4 py-5 text-center">Priority</th>
                <th className="w-[14%] px-4 py-5">Risk Level</th>
                <th className="w-[12%] px-4 py-5">Status</th>
                <th className="w-[8%] px-4 py-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visibleAssignments.length > 0 ? (
                visibleAssignments.map((assignment, index) => (
                  <tr
                    key={assignment.officer}
                    className={`border-b border-[#172638] ${
                      index < 2 ? "bg-[#141827]" : "bg-[#0d1d2d]"
                    } ${index === 0 ? "border-l-4 border-l-[#ffaaa3]" : ""}`}
                  >
                    <td className="px-4 py-6 font-mono text-base leading-7 tracking-[0.04em] text-[#e3ebfa]">
                      {assignment.officer.replace("-", "-\n").split("\n").map((line) => (
                        <span className="block" key={line}>
                          {line}
                        </span>
                      ))}
                    </td>

                    <td className="px-4 py-6">
                      <div className="flex items-start gap-3">
                        <Route className="mt-1 shrink-0 text-[#8fd7ff]" size={18} />

                        <div className="min-w-0">
                          <p className="break-words text-lg font-black leading-snug text-[#e8f0ff]">
                            {assignment.routeSummary}
                          </p>

                          {assignment.routeStops.length > 0 ? (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {assignment.routeStops.map((stop, stopIndex) => (
                                <span
                                  key={`${assignment.officer}-${stop.sequence}-${stop.junction_name}`}
                                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#31445f] bg-[#162337] px-3 py-2 text-xs font-bold text-[#dbe5f5]"
                                >
                                  <span className="rounded bg-[#8fd7ff] px-2 py-0.5 text-[#071321]">
                                    {stop.sequence}
                                  </span>

                                  <span className="max-w-[180px] truncate">
                                    {stop.junction_name || "Unknown Zone"}
                                  </span>

                                  {stopIndex < assignment.routeStops.length - 1 && (
                                    <span className="text-[#8fd7ff]">→</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 break-words text-sm text-[#c7cedd]">
                              {assignment.zone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-6 text-center">
                      <PriorityGauge value={assignment.priority} tone={assignment.riskTone} />
                    </td>

                    <td className="px-4 py-6">
                      <RiskBadge label={assignment.risk} tone={assignment.riskTone} />
                    </td>

                    <td className="px-4 py-6">
                      <StatusLabel label={assignment.statusLabel} tone={assignment.statusTone} />
                    </td>

                    <td className="relative px-4 py-6 text-right">
                      <button
                        className="inline-grid h-10 w-10 place-items-center rounded-md text-[#cbd6e8] hover:bg-white/5"
                        type="button"
                        aria-label={`Actions for ${assignment.officer}`}
                        aria-expanded={openActionMenu === assignment.officer}
                        onClick={() =>
                          setOpenActionMenu((current) =>
                            current === assignment.officer ? null : assignment.officer,
                          )
                        }
                      >
                        <MoreVertical size={25} />
                      </button>

                      {openActionMenu === assignment.officer && (
                        <div className="absolute right-4 top-16 z-30 w-40 overflow-hidden rounded-lg border border-[#2c405c] bg-[#071321] text-left shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                          <ActionMenuButton label="Deploy" onClick={() => updateStatus(assignment.officer, "deployed")} />
                          <ActionMenuButton label="Complete" onClick={() => updateStatus(assignment.officer, "completed")} />
                          <ActionMenuButton label="Reset" onClick={() => updateStatus(assignment.officer, "recommended")} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-8 py-10 text-center text-[#d8dfed]" colSpan={6}>
                    {assignments.length
                      ? "No patrol routes match the current filters."
                      : "No patrol recommendations returned by the backend yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

type AssignmentStatus = "recommended" | "deployed" | "completed";

function toAssignment(recommendation: PatrolRecommendation, statusOverride?: AssignmentStatus) {
  const riskTone = riskToneFromScore(recommendation.risk_score);
  const status = statusOverride ?? normalizeStatus(recommendation.status);

  const routeStops = recommendation.route ?? [];
  const routeSummary =
    recommendation.route_summary ??
    (routeStops.length
      ? routeStops.map((stop) => stop.junction_name || "Unknown Zone").join(" → ")
      : recommendation.junction_name);

  return {
    officer: recommendation.officer_id,
    area: recommendation.junction_name,
    zone: recommendation.assigned_h3_cell,
    routeStops,
    routeSummary,
    priority: Math.round(recommendation.priority_score),
    risk: `${riskLabel(recommendation.risk_score)} - ${Math.round(recommendation.risk_score)}%`,
    riskTone,
    status,
    statusLabel: statusLabel(status),
    statusTone: statusTone(status),
  };
}

function ActionMenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="block w-full px-4 py-3 text-left text-sm font-bold text-[#dbe5f5] hover:bg-[#18283c]"
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function normalizeStatus(status: string): AssignmentStatus {
  if (status === "deployed" || status === "completed") return status;
  return "recommended";
}

function statusLabel(status: AssignmentStatus) {
  if (status === "deployed") return "Deployed";
  if (status === "completed") return "Completed";
  return "Pending deploy";
}

function statusTone(status: AssignmentStatus) {
  if (status === "recommended") return "scheduled";
  return "ready";
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
    <article className={`min-w-0 rounded-xl border bg-[#111f2f] p-5 ${emphasized ? "border-[#466188]" : "border-[#20324a]"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words font-mono text-sm uppercase tracking-[0.08em] text-[#d1dae9]">{label}</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <strong className="break-words text-3xl font-black uppercase leading-none tracking-[0.02em] text-[#dce8fb]">{value}</strong>
            {detail && (
              <span className={detailTone === "good" ? "break-words pb-1 text-sm font-bold text-[#4eff93]" : "break-words pb-1 text-base text-[#d8dfed]"}>
                {detail}
              </span>
            )}
          </div>
        </div>
        {emphasized && <WandSparkles className="mt-10 text-[#a8c4ff]" size={24} />}
      </div>
    </article>
  );
}

function PriorityGauge({ value, tone }: { value: number; tone: string }) {
  const color =
    tone === "elevated"
      ? "#ff7417"
      : tone === "moderate"
        ? "#ffd21e"
        : tone === "nominal"
          ? "#4add78"
          : "#ffaaa3";

  return (
    <div className="mx-auto w-full max-w-[100px]">
      <p className="text-2xl font-black" style={{ color }}>
        {value}
      </p>
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
    <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-3 text-xs font-black uppercase ${classes}`}>
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
    <span className="inline-flex max-w-full items-center gap-2 break-words text-base text-[#e5ecf9]">
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