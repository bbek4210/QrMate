import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type EventDetails = {
  id: number;
  title: string;
  base_event: {
    id: number;
    name: string;
    city: string;
    code: string;
    address: string | null;
    created_date: string;
  };
  created_date: string;
};
const fetchEvents = async (): Promise<EventDetails[]> => {
  const { data } = await axiosInstance.get("/event/");

  if (data && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

const GET_EVENT_QUERY_KEY = "GET_EVENT_QUERY_KEY";
const useGetEvents = (zefeUserId: string) => {
  return useQuery<EventDetails[], Error>({
    queryKey: [GET_EVENT_QUERY_KEY, zefeUserId],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(zefeUserId),
  });
};

export default useGetEvents;
