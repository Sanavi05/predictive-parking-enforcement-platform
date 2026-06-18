import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import PredictionCard from "../components/PredictionCard";
import { predictRisk } from "../services/api";

export default function Predictions() {
  const [latitude, setLatitude] = useState("12.9716");
  const [longitude, setLongitude] = useState("77.5946");
  const [time, setTime] = useState("2026-07-01T18:00");
  const mutation = useMutation({ mutationFn: predictRisk });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate({ latitude: Number(latitude), longitude: Number(longitude), timestamp: time });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <form className="panel space-y-4 p-5" onSubmit={onSubmit}>
        <h2 className="text-lg font-semibold">Future Risk Prediction</h2>
        <label className="block">
          <span className="text-sm text-slate-400">Latitude</span>
          <input className="mt-1 w-full rounded-lg border border-line bg-slate-950 px-3 py-2" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Longitude</span>
          <input className="mt-1 w-full rounded-lg border border-line bg-slate-950 px-3 py-2" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Date and Time</span>
          <input className="mt-1 w-full rounded-lg border border-line bg-slate-950 px-3 py-2" type="datetime-local" value={time} onChange={(event) => setTime(event.target.value)} />
        </label>
        <button className="w-full rounded-lg bg-signal px-4 py-2 font-semibold text-slate-950" type="submit">
          Generate Prediction
        </button>
      </form>
      <PredictionCard prediction={mutation.data} />
    </div>
  );
}
