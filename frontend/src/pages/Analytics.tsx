import Charts from "../components/Charts";
import MetricCards from "../components/MetricCards";
import { useAnalytics } from "../hooks/useApi";

export default function Analytics() {
  const { data } = useAnalytics();

  return (
    <div className="space-y-5">
      <MetricCards
        metrics={[
          { label: "Total Violations", value: data?.total_violations ?? "--", tone: "critical" },
          { label: "Vehicle Types", value: data?.violations_by_vehicle_type.length ?? "--", tone: "high" },
          { label: "Top Junctions", value: data?.top_junctions.length ?? "--", tone: "moderate" },
          { label: "Stations", value: data?.top_police_stations.length ?? "--", tone: "safe" },
        ]}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Charts title="Hourly Patterns" data={data?.violations_by_hour ?? []} />
        <Charts title="Vehicle Distribution" data={data?.violations_by_vehicle_type ?? []} />
        <Charts title="Top Junctions" data={data?.top_junctions ?? []} />
        <Charts title="Top Police Stations" data={data?.top_police_stations ?? []} />
      </div>
    </div>
  );
}
