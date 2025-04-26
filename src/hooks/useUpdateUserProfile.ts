import axiosInstance from "@/lib/axios";
import { getCookie } from "@/lib/cookies";
import { useMutation } from "@tanstack/react-query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateUserProfile = async (userData: any) => {
  const token = getCookie("access_token");

  const { data } = await axiosInstance.put("/userprofile/", userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: updateUserProfile,
  });
};

export default useUpdateUserProfile;
