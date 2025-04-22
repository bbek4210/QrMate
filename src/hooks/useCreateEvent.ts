import axiosInstance from "@/lib/axios";
import { getCookie } from "@/lib/cookies";
import { useMutation } from "@tanstack/react-query";

type EventData = {
  title: string;
  city: string;
};

const createEvent = async (eventData: EventData) => {
  const { data } = await axiosInstance.post("/event/", eventData);

  return data;
};

const useCreateEvent = () => {
  return useMutation<EventData, Error, EventData>({
    mutationFn: createEvent,
  });
};

export default useCreateEvent;
