import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { userQueryKeys } from "@/lib/query-keys";

const useGetUserProfile = () => {
  // Use localStorage instead of cookies for token
  const token = typeof window !== 'undefined' ? localStorage.getItem('qr-mate-access-token') : null;
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: api.user.getProfile,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: Boolean(token),
    // Prevent hydration issues
    refetchOnMount: true,
    retry: 1
  });
};

export default useGetUserProfile;
