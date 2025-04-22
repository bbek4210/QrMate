// hooks/useUploadFile.ts
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({ file, key }: { file: File; key: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);

      const response = await axiosInstance.post("/upload/file/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data; // contains file_url
    },
  });
};

export default useUploadFile;
