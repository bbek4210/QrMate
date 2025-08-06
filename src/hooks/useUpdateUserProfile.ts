// lib/hooks/useInitUser.ts
import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

// Define the shape of the request payload
interface InitUserPayload {
  telegram_id: number;
  first_name: string;
  last_name: string;
  username: string;
}

// Define the expected structure of the response (simplified)
interface InitUserResponse {
  status: string;
  status_code: number;
  message: string;
  data: {
    data: {
      id: number;
      telegram_id: string;
      username: string;
      access_token: string;
      refresh_token: string;
    };
  };
  timestamp: string;
}

// Mutation function that posts to the init API
const initUserProfile = async (
  userData: InitUserPayload
): Promise<InitUserResponse> => {
  const { data } = await axiosInstance.post("init/", userData); // ✅ no extra prefix
  return data;
};

// Custom React Query mutation hook
const useInitUser = () => {
  return useMutation<InitUserResponse, unknown, InitUserPayload>({
    mutationFn: initUserProfile,
  });
};

export default useInitUser;
