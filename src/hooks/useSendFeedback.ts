import axiosInstance from "@/lib/axios";
import { getCookie } from "@/lib/cookies";
import { useMutation } from "@tanstack/react-query";

const sendFeedback = async (formData: FormData) => {
  const token = getCookie("access_token");

  const { data } = await axiosInstance.post("/userfeedback/", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

const useSendFeedback = () => {
  return useMutation({
    mutationFn: sendFeedback,
  });
};

export default useSendFeedback;
