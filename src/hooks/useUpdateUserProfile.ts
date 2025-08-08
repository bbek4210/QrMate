import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userQueryKeys } from "@/lib/query-keys";

// Define the shape of the update profile payload
interface UpdateProfilePayload {
  name?: string;
  username?: string;
  position?: string;
  project_name?: string;
  city?: string;
  twitter_account?: string;
  linkedin_url?: string;
  email?: string;
  selected_fields?: number[];
  photo_url?: string;
}

// Define the expected structure of the response
interface UpdateProfileResponse {
  status: string;
  message: string;
  data: any;
}

// Mutation function that updates the user profile
const updateUserProfile = async (
  userData: UpdateProfilePayload
): Promise<UpdateProfileResponse> => {
  console.log('Sending profile update data:', userData);
  const { data } = await axiosInstance.patch("/web/profile/", userData);
  console.log('Profile update response:', data);
  return data;
};

// Custom React Query mutation hook
const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UpdateProfileResponse, unknown, UpdateProfilePayload>({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      // Invalidate and refetch user profile after update
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },
  });
};

export default useUpdateUserProfile;
