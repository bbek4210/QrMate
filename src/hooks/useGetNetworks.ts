// hooks/useFetchNetworksAndConnections.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { QUERY_KEYS } from "@/lib/query-keys";

export const fetchNetworkData = async (filters?: {
  event?: string;
  position?: string;
  city?: string;
  field?: string;
}) => {
  console.log("Fetching networks with filters:", filters);
  const queryParams = new URLSearchParams();
  for (const key in filters) {
    const value = filters[key as keyof typeof filters];
    if (value) queryParams.append(key, value);
  }

  const response = await axiosInstance.get(
    `/networks_and_connnections/?${queryParams.toString()}`
  );
  console.log("Networks API response:", response.data);
  return response.data;
};

const useFetchNetworksAndConnections = (filters?: {
  event?: string;
  position?: string;
  city?: string;
  field?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.NETWORKS_AND_CONNECTIONS, filters],
    queryFn: () => fetchNetworkData(filters),
    staleTime: 0, // Always refetch when requested
  });
};

export default useFetchNetworksAndConnections;
