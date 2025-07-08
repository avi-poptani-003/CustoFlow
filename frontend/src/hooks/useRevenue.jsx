import { useQuery } from "@tanstack/react-query";
import leadService from "../services/leadService";

export const useRevenue = (timeRange) => {
  return useQuery({
    queryKey: ["revenue", timeRange],
    queryFn: () => leadService.getRevenueOverview({ time_range: timeRange }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    enabled: !!timeRange, // Only run the query if timeRange is available
    onError: (err) => {
      console.error("Error fetching revenue data:", err);
    },
  });
};
