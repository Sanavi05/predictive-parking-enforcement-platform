import type { PredictionResponse } from "../types";

export default function PredictionCard({ prediction }: { prediction?: PredictionResponse }) {
  if (!prediction) {
    return (
      <section className="panel p-5 text-slate-400">
        Select a location and time to generate an enforcement prediction.
      </section>
    );
  }

  return (
    <section className="panel p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-slate-400">Predicted Violations</p>
          <strong className="text-3xl text-orange-300">{prediction.predicted_violations}</strong>
        </div>
        <div>
          <p className="text-sm text-slate-400">Hotspot Risk</p>
          <strong className="text-3xl text-red-400">{prediction.risk_score}</strong>
        </div>
        <div>
          <p className="text-sm text-slate-400">Congestion Impact</p>
          <strong className="text-3xl text-yellow-300">{prediction.congestion_score}</strong>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-slate-950/50 p-4">
          <p className="text-sm text-slate-400">Recommended Officers</p>
          <p className="mt-1 text-2xl font-semibold">{prediction.recommended_officers}</p>
        </div>
        <div className="rounded-lg bg-slate-950/50 p-4">
          <p className="text-sm text-slate-400">Recommended Tow Trucks</p>
          <p className="mt-1 text-2xl font-semibold">{prediction.recommended_tow_trucks}</p>
        </div>
      </div>
    </section>
  );
}
