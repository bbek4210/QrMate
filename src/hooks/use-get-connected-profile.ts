// hooks/useGetConnectionProfile.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { QUERY_KEYS } from "@/lib/query-keys";

export type DetailedNetworkConnection = {
  user: {
    id: number;
    uuid: string;
    name: string;
    username: string;
    photo_url: string | null;
    user_profile: {
      position: string;
      project_name: string;
      city: string;
      telegram_account: string;
      linkedin_url: string;
      twitter_account: string;
      user_fields: Array<Record<string, any>>
    };
  };
  network_information: {
    id: number;
    base_event: {
      id: number;
      name: string;
    };
    scanner_event_title: string;
    scanned_event_title: string;
    summary_note: string;
    meeting_images: string[]; // Assuming these are URLs or identifiers
  };
};



const fetchConnectionProfile = async (id: number) => {
  const response = await axiosInstance.get(`/networks_and_connnections/${id}/`);
  return response.data.data as DetailedNetworkConnection;
};

const useGetConnectionProfile = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONNECTION_PROFILE, id],
    queryFn: () => fetchConnectionProfile(id!),
    enabled: !!id,
  });
};

export default useGetConnectionProfile;
