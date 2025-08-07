import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type EventData = {
  title: string;
  city: string;
};

const createEvent = async (eventData: EventData) => {
  const { data } = await axiosInstance.post("/event/", eventData);

  return data;
};

const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<EventData, Error, EventData>({
    mutationFn: createEvent,
    onSuccess: () => {
      // Invalidate and refetch events after creating a new event
      queryClient.invalidateQueries({ queryKey: ["GET_EVENT_QUERY_KEY"] });
    },
  });
};

export default useCreateEvent;
