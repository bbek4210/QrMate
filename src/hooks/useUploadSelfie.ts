import axiosInstance from "@/lib/axios";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

type UploadSelfieData = {
  image: File;
  note: string;
};
type UploadResponse = {
  message: string;
};
const uploadSelfie = async (
  data: UploadSelfieData
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", data.image);
  formData.append("note", data.note);

  const response = await axiosInstance.post("/user_selfie/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const useUploadSelfie = (): UseMutationResult<
  UploadResponse,
  Error,
  UploadSelfieData
> => {
  return useMutation({
    mutationFn: uploadSelfie,
  });
};

export default useUploadSelfie;
