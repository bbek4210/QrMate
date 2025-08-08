import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { networkingQueryKeys } from "@/lib/query-keys";
import { NetworkFilters } from "@/types/api";

const useFetchNetworksAndConnections = (filters?: NetworkFilters) => {
  return useQuery({
    queryKey: networkingQueryKeys.networksAndConnections(filters),
    queryFn: () => api.networking.getNetworksAndConnections(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export default useFetchNetworksAndConnections;
