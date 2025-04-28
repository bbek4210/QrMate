import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { getCookie } from "@/lib/cookies";

export const USERPROFILE_QUERY_KEY = "USERPROFILE_QUERY_KEY";

const fetchUserProfile = async () => {
  const response = await axiosInstance.get("/userprofile/");
  return response.data.data;
};

const useGetUserProfile = () => {
  const token = getCookie("access_token");
  return useQuery({
    queryKey: [USERPROFILE_QUERY_KEY],
    queryFn: fetchUserProfile,
    refetchOnWindowFocus: true,
    staleTime: 0,
    enabled: Boolean(token)
  });
};

export default useGetUserProfile;
