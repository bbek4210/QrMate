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
      telegram_account: string | null;
      linkedin_url: string | null;
      twitter_account: string | null;
      user_fields: Array<Record<string, any>>
    };
  };
  network_information: {
    id: number;
    base_event: {
      id: number;
      name: string;
      code: string;
      city: string;
      address: string | null;
    };
    meeting_informations: Array<{
      id: number;
      summary_note: string;
      information_saved_user_id: number;
      meeting_images: Array<any>;
    }>;
  };
};



const fetchConnectionProfile = async (id: number) => {
  const response = await axiosInstance.get(`/networks_and_connnections/${id}/`);
  return response.data as DetailedNetworkConnection;
};

const useGetConnectionProfile = (currentUserId: number, connectedUserId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONNECTION_PROFILE, connectedUserId],
    queryFn: () => fetchConnectionProfile(connectedUserId),
    enabled: !!connectedUserId && !!currentUserId,
  });
};

export default useGetConnectionProfile;
