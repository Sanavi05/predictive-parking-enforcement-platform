import { useQuery } from "@tanstack/react-query";

import { getAnalytics, getHotspots, getPatrolRecommendations } from "../services/api";

export function useAnalytics() {
  return useQuery({ queryKey: ["analytics"], queryFn: getAnalytics });
}

export function useHotspots() {
  return useQuery({ queryKey: ["hotspots"], queryFn: getHotspots });
}

export function usePatrolRecommendations() {
  return useQuery({ queryKey: ["patrol"], queryFn: getPatrolRecommendations });
}
