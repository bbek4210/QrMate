import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const USERPROFILE_QUERY_KEY = "USERPROFILE_QUERY_KEY";

const fetchUserProfile = async () => {
  const response = await axiosInstance.get("/userprofile/");
  return response.data.data;
};

const useGetUserProfile = () => {
  return useQuery({
    queryKey: [USERPROFILE_QUERY_KEY],
    queryFn: fetchUserProfile,
  });
};

export default useGetUserProfile;
