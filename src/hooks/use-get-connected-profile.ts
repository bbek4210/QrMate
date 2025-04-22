// hooks/useGetConnectionProfile.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { QUERY_KEYS } from "@/lib/query-keys";

const fetchConnectionProfile = async (id: number) => {
  const response = await axiosInstance.get(`/networks_and_connnections/${id}/`);
  return response.data.data;
};

const useGetConnectionProfile = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONNECTION_PROFILE, id],
    queryFn: () => fetchConnectionProfile(id!),
    enabled: !!id,
  });
};

export default useGetConnectionProfile;
