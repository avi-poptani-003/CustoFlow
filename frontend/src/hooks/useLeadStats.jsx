import { useState, useEffect, useCallback } from "react";
import LeadService from "../services/leadService";

export const useLeadStats = (initialTimeRange = "week") => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (timeRange) => {
    try {
      setLoading(true);
      setError(null);

      // Use the modified leadService function
      const data = await LeadService.getDashboardStats(timeRange);
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard statistics");
      console.error("Failed to fetch lead stats:", err);
    } finally {
      setLoading(false);
    }
  }, []); // useCallback to memoize the fetch function

  useEffect(() => {
    // Initial fetch on component mount
    fetchStats(initialTimeRange);
  }, [fetchStats, initialTimeRange]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats, // Expose the fetch function for manual refetching
  };
};
