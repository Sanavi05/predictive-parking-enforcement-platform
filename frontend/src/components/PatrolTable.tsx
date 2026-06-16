import type { PatrolRecommendation } from "../types";

export default function PatrolTable({ rows }: { rows: PatrolRecommendation[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-950/60 text-slate-300">
            <tr>
              <th className="px-4 py-3">Officer</th>
              <th className="px-4 py-3">Junction</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Expected Violations</th>
              <th className="px-4 py-3">Impact Reduction</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-t border-line" key={row.officer_id}>
                <td className="px-4 py-3 font-medium">{row.officer_id}</td>
                <td className="px-4 py-3">{row.junction_name}</td>
                <td className="px-4 py-3 text-signal">{row.priority_score}</td>
                <td className="px-4 py-3 text-red-300">{row.risk_score}</td>
                <td className="px-4 py-3">{row.expected_violations}</td>
                <td className="px-4 py-3">{row.expected_impact_reduction}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
