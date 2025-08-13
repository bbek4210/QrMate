import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export type EventDetails = {
  id: number;
  title: string;
  description?: string;
  code?: string;
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
  try {
    const { data } = await axiosInstance.get("/event/");

    if (data && Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

const GET_EVENT_QUERY_KEY = "GET_EVENT_QUERY_KEY";
const useGetEvents = (qrmateUserId: string) => {
  return useQuery<EventDetails[], Error>({
    queryKey: [GET_EVENT_QUERY_KEY, qrmateUserId],
    queryFn: fetchEvents,
    staleTime: 0, // Always refetch when requested
    enabled: Boolean(qrmateUserId),
  });
};

export default useGetEvents;
