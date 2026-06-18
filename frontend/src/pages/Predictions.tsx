import { FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  Cpu,
  Info,
  Lightbulb,
  RadioTower,
  Rocket,
  UserCircle2,
} from "lucide-react";

import MapView from "../components/MapView";
import { useHotspots } from "../hooks/useApi";
import { predictRisk } from "../services/api";

export default function Predictions() {
  const { data: hotspots = [] } = useHotspots();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [date, setDate] = useState(currentDateInput());
  const [time, setTime] = useState(currentTimeInput());
  const mutation = useMutation({ mutationFn: predictRisk });

  const prediction = mutation.data;
  const riskScore = prediction?.risk_score;
  const violations = prediction?.predicted_violations;
  const congestion = prediction?.congestion_score;
  const selectedMarker = latitude && longitude ? [{ lat: Number(latitude), lng: Number(longitude), risk: riskFromScore(riskScore) }] : [];

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
    mutation.mutate({
      latitude: Number(latitude),
      longitude: Number(longitude),
      timestamp: `${date}T${time}`,
    });
  }

  return (
    <div className="mx-auto max-w-[1220px] pb-10">
      <header className="-mx-4 -mt-5 mb-9 flex min-h-20 items-center justify-between border-b border-[#152439] bg-[#061321] px-8 sm:-mx-6 lg:-mx-8">
        <p className="font-mono text-xl font-black uppercase tracking-[0.12em] text-[#cbd3df]">
          Control Panel <span className="px-3 text-[#6f7f96]">/</span> <span className="text-[#b8ccff]">Predictions</span>
        </p>
        <div className="flex items-center gap-6 text-[#d9e3f4]">
        </div>
      </header>

      <section className="mb-10">
        <h1 className="text-4xl font-black tracking-[-0.03em] text-[#e5eefc]">Predictive Risk Engine</h1>
        <p className="mt-2 max-w-[850px] text-xl leading-8 text-[#d0d6e4]">
          Submit a location and time to the backend model services for parking violation and congestion predictions.
        </p>
      </section>

      <section className="grid gap-8 xl:grid-cols-[480px_minmax(0,1fr)]">
        <form className="rounded-xl border border-[#20324a] bg-[#111a29] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]" onSubmit={onSubmit}>
          <h2 className="mb-9 flex items-center gap-3 text-3xl font-medium text-[#e8f0ff]">
            <Cpu className="text-[#a8c4ff]" size={26} />
            Parameter Configuration
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Latitude">
              <input className="prediction-input" value={latitude} onChange={(event) => setLatitude(event.target.value)} required />
            </Field>
            <Field label="Longitude">
              <input className="prediction-input" value={longitude} onChange={(event) => setLongitude(event.target.value)} required />
            </Field>
          </div>

          <Field label="Prediction Date" className="mt-8">
            <div className="relative">
              <input className="prediction-input w-full pr-12" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              <CalendarDays className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#c8d2e3]" size={25} />
            </div>
          </Field>

          <Field label="Time Window" className="mt-8">
            <div className="relative">
              <input className="prediction-input w-full pr-12" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
              <Clock3 className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#c8d2e3]" size={25} />
            </div>
          </Field>

          {/* <Field label="Model Source" className="mt-8">
            <button className="prediction-input flex w-full items-center justify-between text-left" type="button">
              Backend ML Ensemble
              <ChevronDown className="text-[#8e9bb0]" size={24} />
            </button>
          </Field> */}

          <button
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-[#a8c4ff] px-5 py-5 text-xl font-black uppercase text-[#102149] shadow-[0_16px_32px_rgba(95,128,200,0.28)] disabled:opacity-70"
            type="submit"
            disabled={mutation.isPending}
          >
            <Rocket size={25} />
            {mutation.isPending ? "Generating..." : "Generate Prediction"}
          </button>

          <div className="mt-12 flex gap-5 rounded-lg border border-[#18304a] bg-[#0d1f33] p-5 text-[#d9e1ef]">
            <Info className="shrink-0 text-[#4eff93]" size={27} />
            <p className="text-lg leading-7">Inputs are submitted to the backend prediction endpoint and scored by the loaded model services.</p>
          </div>
        </form>

        <div className="space-y-8">
          <section className="rounded-xl border-l-4 border-[#ffaaa3] bg-[#191d2a] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="rounded-full border border-[#9d6f75] bg-[#3a2f3a] px-5 py-3 font-mono text-sm font-black uppercase leading-4 tracking-[0.12em] text-[#ffb1a9]">
                    {prediction?.risk_level ?? "Awaiting"}<br />Risk
                  </span>
                  <p className="text-lg text-[#dce3f0]">Model Output:<br />{prediction ? "Backend prediction received" : "Submit parameters to score"}</p>
                </div>
                <p className="mt-6 text-xl text-[#edf3ff]">Violation Likelihood</p>
                <div className="mt-6 grid max-w-[390px] grid-cols-2 gap-6 font-mono text-xl font-black uppercase tracking-[0.08em]">
                  <span className="text-[#dce3f0]">Current<br />Risk:</span>
                  <span className="text-[#ffb1a9]">{prediction?.risk_level ?? "--"}<br />Threshold</span>
                </div>
              </div>
              <div className="text-center">
                <strong className="block text-8xl font-black leading-none tracking-[-0.06em] text-[#ffaaa3]">{formatNumber(riskScore)}</strong>
                <p className="mt-3 font-mono text-lg font-black uppercase tracking-[0.4em] text-[#d7deeb]">Risk Index Score</p>
              </div>
            </div>
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            <ResultCard icon={<AlertTriangle size={30} />} label="Predicted Violations" value={formatNumber(violations)} suffix="cases" trend={prediction?.risk_level ?? "Awaiting"} tone="blue" fill={riskScore ?? 0} />
            <ResultCard icon={<RadioTower size={30} />} label="Congestion Impact" value={formatNumber(congestion)} suffix={prediction?.congestion_level ?? "score"} trend="Model score" tone="green" fill={congestion ?? 0} />
          </div>

          <section className="rounded-xl border border-[#385579] border-l-[#a8c4ff] bg-[#0d1f33] p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="grid h-[70px] w-[70px] shrink-0 place-items-center rounded-full bg-[#3a4f6d] text-[#c7d8ff]">
                <Lightbulb size={35} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-[#c7d8ff]">Recommended Action</h2>
                <p className="mt-3 max-w-[560px] text-lg leading-7 text-[#e0e6f2]">
                  {prediction
                    ? `Assign ${prediction.recommended_officers} officer(s) and ${prediction.recommended_tow_trucks} tow truck(s) for the submitted location.`
                    : "Generate a prediction to receive backend-recommended enforcement resources."}
                </p>
              </div>
              <button className="rounded-lg border border-[#587197] px-8 py-3 font-mono text-sm font-black uppercase tracking-[0.06em] text-[#d9e5ff]" type="button">
                Execute
              </button>
            </div>
          </section>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-[#172638] bg-[#111a29] p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-mono text-2xl font-black uppercase tracking-[0.12em] text-[#e5ecf9]">Spatial Context Preview</h2>
          <div className="flex gap-2">
            <button className="rounded-md bg-[#28384d] px-4 py-2 font-mono text-sm font-black uppercase text-[#d6deef]" type="button">Heatmap</button>
            <button className="rounded-md bg-[#a8c4ff] px-4 py-2 font-mono text-sm font-black uppercase text-[#102149]" type="button">Backend Zone</button>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-[#20324a] bg-[#09182a]">
          <MapView markers={selectedMarker} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-3 block font-mono text-sm uppercase tracking-[0.12em] text-[#d1dae9]">{label}</span>
      {children}
    </label>
  );
}

function ResultCard({
  icon,
  label,
  value,
  suffix,
  trend,
  tone,
  fill,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix: string;
  trend: string;
  tone: "blue" | "green";
  fill: number;
}) {
  const color = tone === "blue" ? "#5ba0ff" : "#4add78";

  return (
    <article className="rounded-xl border border-[#20324a] bg-[#111a29] p-8">
      <div className="flex items-start justify-between">
        <span className={`grid h-12 w-12 place-items-center rounded-lg ${tone === "blue" ? "bg-[#182f56] text-[#5ba0ff]" : "bg-[#153a31] text-[#4add78]"}`}>
          {icon}
        </span>
        <span className="font-mono text-sm font-black text-[#d5ddeb]">{trend}</span>
      </div>
      <p className="mt-20 font-mono text-sm uppercase tracking-[0.12em] text-[#d1dae9]">{label}</p>
      <div className="mt-3 flex items-end gap-3">
        <strong className="text-4xl font-black tracking-[-0.03em] text-[#e5eefc]">{value}</strong>
        <span className="pb-1 text-lg font-bold text-[#d1dae9]">{suffix}</span>
      </div>
      <div className="mt-24 h-2 rounded-full bg-[#071321]">
        <div className="h-2 rounded-full" style={{ width: `${Math.min(Math.max(fill, 0), 100)}%`, backgroundColor: color }} />
      </div>
    </article>
  );
}

function currentDateInput() {
  return new Date().toISOString().slice(0, 10);
}

function currentTimeInput() {
  return new Date().toTimeString().slice(0, 5);
}

function formatNumber(value?: number) {
  return value === undefined ? "--" : value.toLocaleString();
}

function riskFromScore(score = 0): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
