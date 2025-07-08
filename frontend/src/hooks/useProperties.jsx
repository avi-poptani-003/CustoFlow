import { useQuery } from "@tanstack/react-query";
import propertyService from "../services/propertyService";

export const useProperties = () => {
  return useQuery({
    queryKey: ["properties"],
    queryFn: propertyService.getProperties,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    onError: (err) => {
      console.error("Error fetching properties:", err);
    },
  });
};
