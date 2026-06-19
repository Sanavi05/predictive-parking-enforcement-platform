import type { ExplanationResponse } from "../types";

const directionColor = {
  increase: "bg-red-500",
  decrease: "bg-emerald-500",
  neutral: "bg-yellow-500",
};

const directionIcon = {
  increase: "↑",
  decrease: "↓",
  neutral: "→",
};

export default function ExplanationCard({ explanation }: { explanation: ExplanationResponse | undefined }) {
  if (!explanation) return null;

  const maxImpact = Math.max(...explanation.drivers.map((d) => d.impact));

  return (
    <div className="panel mt-4 p-5 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Prediction Drivers</h3>
        <p className="text-sm text-slate-400 mt-1">{explanation.summary}</p>
      </div>
      <div className="space-y-3">
        {explanation.drivers.map((driver) => (
          <div key={driver.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{directionIcon[driver.direction]}</span>
                <span className="text-sm font-medium">{driver.label}</span>
              </div>
              <span className={`text-sm font-bold ${driver.direction === "increase" ? "text-red-400" : driver.direction === "decrease" ? "text-emerald-400" : "text-yellow-400"}`}>
                +{driver.impact.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${directionColor[driver.direction]}`}
                style={{ width: `${(driver.impact / maxImpact) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{driver.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}