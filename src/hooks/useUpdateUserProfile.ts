import axiosInstance from "@/lib/axios";
import { getCookie } from "@/lib/cookies";
import { useMutation } from "@tanstack/react-query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateUserProfile = async (userData: any) => {
  const { data } = await axiosInstance.put("/userprofile/", userData);

  return data;
};

const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: updateUserProfile,
  });
};

export default useUpdateUserProfile;
