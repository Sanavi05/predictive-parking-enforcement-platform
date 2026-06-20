import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Cpu,
  Lightbulb,
  RadioTower,
  Rocket,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
} from "lucide-react";

import MapView from "../components/MapView";
import { useHotspots } from "../hooks/useApi";
import { predictRisk, explainPrediction } from "../services/api";
import type { ExplanationDriver } from "../types";

export default function Predictions() {
  const { data: hotspots = [] } = useHotspots();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [date, setDate] = useState(currentDateInput());
  const [time, setTime] = useState(currentTimeInput());
  const mutation = useMutation({ mutationFn: predictRisk });
  const explanationMutation = useMutation({ mutationFn: explainPrediction });

  const prediction = mutation.data;
  const explanation = explanationMutation.data;
  const riskScore = prediction?.risk_score;
  const violations = prediction?.predicted_violations;
  const congestion = prediction?.congestion_score;
  const selectedMarker =
    latitude && longitude
      ? [{ lat: Number(latitude), lng: Number(longitude), risk: riskFromScore(riskScore) }]
      : [];

  useEffect(() => {
    if (latitude || longitude || hotspots.length === 0) return;
    const firstHotspot = hotspots[0];
    const lat = firstHotspot.latitude ?? firstHotspot.lat;
    const lng = firstHotspot.longitude ?? firstHotspot.lng;
    if (lat !== undefined && lng !== undefined) {
      setLatitude(String(lat));
      setLongitude(String(lng));
    }
  }, [hotspots, latitude, longitude]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      timestamp: `${date}T${time}`,
    };
    mutation.mutate(payload);
    explanationMutation.mutate(payload);
  }

  return (
    <div className="mx-auto max-w-[1220px] pb-10">
      <header className="-mx-4 -mt-5 mb-9 flex min-h-20 items-center justify-between border-b border-[#152439] bg-[#061321] px-8 sm:-mx-6 lg:-mx-8">
        <p className="font-mono text-xl font-black uppercase tracking-[0.12em] text-[#cbd3df]">
          Control Panel <span className="px-3 text-[#6f7f96]">/</span>{" "}
          <span className="text-[#b8ccff]">Predictions</span>
        </p>
      </header>

      <section className="mb-10">
        <h1 className="text-4xl font-black tracking-[-0.03em] text-[#e5eefc]">Predictive Risk Engine</h1>
        <p className="mt-2 max-w-[850px] text-xl leading-8 text-[#d0d6e4]">
          Submit a location and time to the backend model services for parking violation and congestion predictions.
        </p>
      </section>

      <section className="grid items-start gap-8 xl:grid-cols-[minmax(360px,440px)_minmax(0,1fr)]">

        {/* ── Left column: form + impact simulator ── */}
        <div className="flex min-w-0 flex-col gap-8">
          <form
            className="min-w-0 rounded-xl border border-[#20324a] bg-[#111a29] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-8"
            onSubmit={onSubmit}
          >
            <h2 className="mb-9 flex items-center gap-3 text-3xl font-medium text-[#e8f0ff]">
              <Cpu className="text-[#a8c4ff]" size={26} />
              Parameter Configuration
            </h2>

            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <Field label="Latitude">
                <input
                  className="prediction-input"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </Field>
              <Field label="Longitude">
                <input
                  className="prediction-input"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Prediction Date" className="mt-8">
              <div className="relative">
                <input
                  className="prediction-input w-full pr-12"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <CalendarDays
                  className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#c8d2e3]"
                  size={25}
                />
              </div>
            </Field>

            <Field label="Time Window" className="mt-8">
              <div className="relative">
                <input
                  className="prediction-input w-full pr-12"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
                <Clock3
                  className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#c8d2e3]"
                  size={25}
                />
              </div>
            </Field>

            <button
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-[#a8c4ff] px-5 py-5 text-xl font-black uppercase text-[#102149] shadow-[0_16px_32px_rgba(95,128,200,0.28)] disabled:opacity-70"
              type="submit"
              disabled={mutation.isPending || explanationMutation.isPending}
            >
              <Rocket size={25} />
              {mutation.isPending ? "Generating..." : "Generate Prediction"}
            </button>
          </form>

          {/* Impact Simulator — below form in left column */}
          <section className="rounded-xl border border-[#20324a] bg-[#111a29] p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1e3a5f] text-[#a8c4ff]">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#e5eefc]">Impact Simulator</h2>
                <p className="mt-0.5 text-sm text-[#8e9bb0]">Simulate enforcement deployment effect</p>
              </div>
            </div>
            {prediction ? (
              <ImpactSimulator
                curve={prediction.simulation_curve}
                recommendedOfficers={prediction.recommended_officers}
                predictedViolations={prediction.predicted_violations}
                congestionScore={prediction.congestion_score}
              />
            ) : (
              <p className="text-sm text-[#5a6a80]">Generate a prediction to simulate impact.</p>
            )}
          </section>
        </div>

        {/* ── Right column: all results ── */}
        <div className="min-w-0 space-y-8">
          {/* Risk Score Banner */}
          <section className="rounded-xl border-l-4 border-[#ffaaa3] bg-[#191d2a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-8">
            <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(170px,auto)]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="rounded-full border border-[#9d6f75] bg-[#3a2f3a] px-5 py-3 font-mono text-sm font-black uppercase leading-4 tracking-[0.12em] text-[#ffb1a9]">
                    {prediction?.risk_level ?? "Awaiting"}
                    <br />
                    Risk
                  </span>
                  <p className="text-lg text-[#dce3f0]">
                    Model Output:
                    <br />
                    {prediction ? "Prediction received" : "Submit parameters to score"}
                  </p>
                </div>
                <p className="mt-6 text-xl text-[#edf3ff]">Violation Likelihood</p>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xl font-black uppercase tracking-[0.06em]">
                  <span className="text-[#dce3f0]">Current Risk:</span>
                  <span className="break-words text-[#ffb1a9]">{prediction?.risk_level ?? "--"} Threshold</span>
                </div>
              </div>
              <div className="min-w-0 text-center">
                <strong className="block break-words text-6xl font-black leading-none tracking-[-0.04em] text-[#ffaaa3] sm:text-7xl">
                  {formatNumber(riskScore)}
                </strong>
                <p className="mt-3 break-words font-mono text-base font-black uppercase tracking-[0.2em] text-[#d7deeb]">
                  Risk Index Score
                </p>
              </div>
            </div>
          </section>

          {/* Violations + Congestion cards */}
          <div className="grid gap-8 md:grid-cols-2">
            <ResultCard
              icon={<AlertTriangle size={30} />}
              label="Predicted Violations"
              value={formatNumber(violations)}
              suffix="cases"
              trend={prediction?.risk_level ?? "Awaiting"}
              tone="blue"
              fill={riskScore ?? 0}
            />
            <ResultCard
              icon={<RadioTower size={30} />}
              label="Congestion Impact"
              value={formatNumber(congestion)}
              suffix={prediction?.congestion_level ?? "score"}
              trend="Model score"
              tone="green"
              fill={congestion ?? 0}
            />
          </div>

          {/* Recommended Action */}
          <section className="rounded-xl border border-[#385579] border-l-[#a8c4ff] bg-[#0d1f33] p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="grid h-[70px] w-[70px] shrink-0 place-items-center rounded-full bg-[#3a4f6d] text-[#c7d8ff]">
                <Lightbulb size={35} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black text-[#c7d8ff]">Recommended Action</h2>
                <p className="mt-3 max-w-[560px] text-lg leading-7 text-[#e0e6f2]">
                  {prediction
                    ? `Assign ${prediction.recommended_officers} officer(s) and ${prediction.recommended_tow_trucks} tow truck(s) for the submitted location.`
                    : "Generate a prediction to receive backend-recommended enforcement resources."}
                </p>
              </div>
              <button
                className="w-full rounded-lg border border-[#587197] px-8 py-3 font-mono text-sm font-black uppercase tracking-[0.06em] text-[#d9e5ff] lg:w-auto"
                type="button"
              >
                Execute
              </button>
            </div>
          </section>

          {/* ML Explainability Card */}
          {(explanation || explanationMutation.isPending) && (
            <section className="rounded-xl border border-[#20324a] bg-[#111a29] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1e3a5f] text-[#a8c4ff]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#e5eefc]">Prediction Drivers</h2>
                  {explanation?.summary && (
                    <p className="mt-0.5 text-sm text-[#8e9bb0]">{explanation.summary}</p>
                  )}
                </div>
              </div>

              {explanationMutation.isPending ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 w-1/3 rounded bg-[#1e2d40]" />
                      <div className="h-2 rounded-full bg-[#1e2d40]" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {explanation?.drivers.map((driver) => (
                    <DriverRow
                      key={driver.label}
                      driver={driver}
                      maxImpact={Math.max(...(explanation?.drivers.map((d) => d.impact) ?? [1]))}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </section>

      {/* Map */}
      <section className="mt-10 rounded-xl border border-[#172638] bg-[#111a29] p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-mono text-2xl font-black uppercase tracking-[0.12em] text-[#e5ecf9]">
            Spatial Context Preview
          </h2>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-[#20324a] bg-[#09182a]">
          <MapView markers={selectedMarker} />
        </div>
      </section>
    </div>
  );
}

// ── Impact Simulator ──────────────────────────────────────────────────────────

function ImpactSimulator({
  curve,
  recommendedOfficers,
  predictedViolations,
  congestionScore,
}: {
  curve: number[];
  recommendedOfficers: number;
  predictedViolations: number;
  congestionScore: number;
}) {
  const [officers, setOfficers] = useState(recommendedOfficers);
  const index = Math.min(Math.max(officers - 1, 0), curve.length - 1);
  const reductionPct = curve[index] ?? 0;
  const congestionReduction = roundTo(reductionPct * 0.75, 1);
  const violationsAfter = roundTo(predictedViolations * (1 - reductionPct / 100), 1);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-sm uppercase tracking-widest text-[#8e9bb0]">Officers Deployed</span>
          <span className="text-3xl font-black text-[#a8c4ff]">{officers}</span>
        </div>
        <input
          type="range"
          min={1}
          max={6}
          value={officers}
          onChange={(e) => setOfficers(Number(e.target.value))}
          className="w-full accent-[#a8c4ff]"
        />
        <div className="mt-1 flex justify-between font-mono text-xs text-[#5a6a80]">
          {[1, 2, 3, 4, 5, 6].map((n) => <span key={n}>{n}</span>)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-[#0d1f33] p-4 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[#8e9bb0]">Violations</p>
          <p className="mt-1 text-2xl font-black text-[#ff8f8f]">↓ {reductionPct.toFixed(0)}%</p>
          <p className="mt-1 text-xs text-[#5a6a80]">{violationsAfter.toFixed(1)} expected</p>
        </div>
        <div className="rounded-lg bg-[#0d1f33] p-4 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[#8e9bb0]">Congestion</p>
          <p className="mt-1 text-2xl font-black text-[#4add78]">↓ {congestionReduction.toFixed(0)}%</p>
          <p className="mt-1 text-xs text-[#5a6a80]">{roundTo(congestionScore * (1 - congestionReduction / 100), 1)} score after</p>
        </div>
      </div>

      {officers === recommendedOfficers && (
        <p className="text-center font-mono text-xs font-black uppercase tracking-widest text-[#4eff93]">
          ✓ AI Recommended Deployment
        </p>
      )}
    </div>
  );
}

// ── Driver Row ────────────────────────────────────────────────────────────────

function DriverRow({ driver, maxImpact }: { driver: ExplanationDriver; maxImpact: number }) {
  const barWidth = `${(driver.impact / maxImpact) * 100}%`;
  const colors = {
    increase: { bar: "#ff6b6b", text: "text-[#ff8f8f]", icon: <TrendingUp size={14} /> },
    decrease: { bar: "#4add78", text: "text-[#4add78]", icon: <TrendingDown size={14} /> },
    neutral:  { bar: "#f0c040", text: "text-[#f0c040]", icon: <Minus size={14} /> },
  };
  const c = colors[driver.direction];

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={c.text}>{c.icon}</span>
          <span className="text-sm font-semibold text-[#d1dae9]">{driver.label}</span>
        </div>
        <span className={`font-mono text-sm font-black ${c.text}`}>+{driver.impact.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#0d1f33]">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: barWidth, backgroundColor: c.bar }}
        />
      </div>
      <p className="mt-1 text-xs text-[#5a6a80]">{driver.detail}</p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-3 block font-mono text-sm uppercase tracking-[0.12em] text-[#d1dae9]">{label}</span>
      {children}
    </label>
  );
}

function ResultCard({
  icon, label, value, suffix, trend, tone, fill,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  suffix: string; trend: string; tone: "blue" | "green"; fill: number;
}) {
  const color = tone === "blue" ? "#5ba0ff" : "#4add78";
  return (
    <article className="min-w-0 rounded-xl border border-[#20324a] bg-[#111a29] p-6">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-12 w-12 place-items-center rounded-lg ${tone === "blue" ? "bg-[#182f56] text-[#5ba0ff]" : "bg-[#153a31] text-[#4add78]"}`}>
          {icon}
        </span>
        <span className="min-w-0 break-words text-right font-mono text-sm font-black text-[#d5ddeb]">{trend}</span>
      </div>
      <p className="mt-14 break-words font-mono text-sm uppercase tracking-[0.08em] text-[#d1dae9]">{label}</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <strong className="break-words text-3xl font-black tracking-[-0.02em] text-[#e5eefc]">{value}</strong>
        <span className="break-words pb-1 text-base font-bold text-[#d1dae9]">{suffix}</span>
      </div>
      <div className="mt-16 h-2 rounded-full bg-[#071321]">
        <div className="h-2 rounded-full" style={{ width: `${Math.min(Math.max(fill, 0), 100)}%`, backgroundColor: color }} />
      </div>
    </article>
  );
}

function currentDateInput() { return new Date().toISOString().slice(0, 10); }
function currentTimeInput() { return new Date().toTimeString().slice(0, 5); }
function formatNumber(value?: number) { return value === undefined ? "--" : value.toLocaleString(); }
function roundTo(value: number, decimals: number) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
function riskFromScore(score = 0): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}