import HeatMap from "../components/HeatMap";
import MapView from "../components/MapView";
import MetricCards from "../components/MetricCards";
import { useAnalytics, useDashboardSummary, useHotspots } from "../hooks/useApi";

export default function Dashboard() {
  const { data: analytics } = useAnalytics();
  const { data: summary } = useDashboardSummary();
  const { data: hotspots = [] } = useHotspots();

  return (
    <div className="space-y-5">
      <MetricCards
        metrics={[
          { label: "Critical Zones", value: summary?.critical_zones ?? "--", tone: "critical" },
          { label: "High Risk Zones", value: summary?.high_risk_zones ?? "--", tone: "high" },
          { label: "Expected Violations Today", value: summary?.expected_violations_today ?? analytics?.total_violations ?? "--", tone: "moderate" },
          { label: "Average Congestion", value: summary?.average_congestion_score ?? "--", tone: "safe" },
        ]}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <MapView hotspots={hotspots} />
        <HeatMap hotspots={hotspots} />
      </div>
    </div>
  );
}
