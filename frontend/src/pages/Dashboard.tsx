import HeatMap from "../components/HeatMap";
import MapView from "../components/MapView";
import MetricCards from "../components/MetricCards";
import { useAnalytics, useHotspots } from "../hooks/useApi";

export default function Dashboard() {
  const { data: analytics } = useAnalytics();
  const { data: hotspots = [] } = useHotspots();
  const criticalZones = hotspots.filter((item) => item.risk_score >= 85).length;

  return (
    <div className="space-y-5">
      <MetricCards
        metrics={[
          { label: "Total Violations", value: analytics?.total_violations ?? "--", tone: "critical" },
          { label: "Critical Zones", value: criticalZones, tone: "high" },
          { label: "Peak Periods", value: analytics?.peak_periods.join(", ") ?? "--", tone: "moderate" },
          { label: "System Status", value: "Live", tone: "safe" },
        ]}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <MapView hotspots={hotspots} />
        <HeatMap hotspots={hotspots} />
      </div>
    </div>
  );
}
