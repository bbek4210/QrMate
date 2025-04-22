// hooks/use-make-selfie-note.ts
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface MakeSelfieNotePayload {
  network_id: number;
  base_event_id: number;
  summary_note: string;
  meeting_images: {
    note: string;
    image: string;
  }[];
}

const useMakeSelfieNote = () => {
  return useMutation({
    mutationFn: async (data: MakeSelfieNotePayload) => {
      const response = await axiosInstance.post("/save-network-information/", data);
      return response.data;
    },
  });
};

export default useMakeSelfieNote;
