type Metric = {
  label: string;
  value: string | number;
  tone: "critical" | "high" | "moderate" | "safe";
};

const toneClass = {
  critical: "text-red-400",
  high: "text-orange-300",
  moderate: "text-yellow-300",
  safe: "text-emerald-300",
};

export default function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <section className="metric" key={metric.label}>
          <p className="text-sm text-slate-400">{metric.label}</p>
          <strong className={`mt-2 block text-2xl ${toneClass[metric.tone]}`}>{metric.value}</strong>
        </section>
      ))}
    </div>
  );
}
