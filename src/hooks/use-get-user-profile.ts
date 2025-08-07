import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const USERPROFILE_QUERY_KEY = "USERPROFILE_QUERY_KEY";

const fetchUserProfile = async () => {
  const response = await axiosInstance.get("/web/profile/");
  return response.data;
};

const useGetUserProfile = () => {
  // Use localStorage instead of cookies for token
  const token = typeof window !== 'undefined' ? localStorage.getItem('qr-mate-access-token') : null;
  return useQuery({
    queryKey: [USERPROFILE_QUERY_KEY],
    queryFn: fetchUserProfile,
    refetchOnWindowFocus: true,
    staleTime: 0,
    enabled: Boolean(token),
    // Prevent hydration issues
    refetchOnMount: true,
    retry: false
  });
};

export default useGetUserProfile;
