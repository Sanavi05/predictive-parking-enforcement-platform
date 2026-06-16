import MetricCards from "../components/MetricCards";
import PatrolTable from "../components/PatrolTable";
import { usePatrolRecommendations } from "../hooks/useApi";

export default function Patrol() {
  const { data = [] } = usePatrolRecommendations();
  const averagePriority = data.length ? Math.round(data.reduce((sum, row) => sum + row.priority_score, 0) / data.length) : "--";

  return (
    <div className="space-y-5">
      <MetricCards
        metrics={[
          { label: "Available Officers", value: data.length, tone: "safe" },
          { label: "Recommended Deployments", value: data.length, tone: "high" },
          { label: "Average Priority", value: averagePriority, tone: "moderate" },
          { label: "Planner Mode", value: "AI Assisted", tone: "safe" },
        ]}
      />
      <PatrolTable rows={data} />
    </div>
  );
}
