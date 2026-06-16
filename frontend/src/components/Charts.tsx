import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { CountBucket } from "../types";

export default function Charts({ title, data }: { title: string; data: CountBucket[] }) {
  return (
    <section className="panel p-4">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#243044" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #243044", color: "#e2e8f0" }} />
            <Bar dataKey="count" fill="#20d3a2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
