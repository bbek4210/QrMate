import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { QUERY_KEYS } from "@/lib/query-keys";

const fetchSelfieNote = async (id: number) => {
  const response = await axiosInstance.get(`/get-network-information/${id}/`);
  return response.data.data;
};

const useGetSelfieNote = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_SELFIE_NOTE, id],
    queryFn: () => fetchSelfieNote(id!),
    enabled: !!id,
  });
};

export default useGetSelfieNote;
