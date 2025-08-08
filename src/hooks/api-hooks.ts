import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { userQueryKeys, networkingQueryKeys, eventsQueryKeys, walletQueryKeys } from '@/lib/query-keys';
import {
  LoginRequest,
  SignupRequest,
  UpdateProfileRequest,
  NetworkFilters,
  UserFilters,
} from '@/types/api';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export const useTestAPI = () => {
  return useQuery({
    queryKey: ['auth-test'],
    queryFn: api.auth.test,
    enabled: false, // Only run when explicitly called
  });
};

// ============================================================================
// USER HOOKS
// ============================================================================

export const useGetUserProfile = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('qr-mate-access-token') : null;
  
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: api.user.getProfile,
    enabled: Boolean(token),
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.user.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });
};

export const useGetUserPositions = () => {
  return useQuery({
    queryKey: userQueryKeys.positions(),
    queryFn: api.user.getPositions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetFields = () => {
  return useQuery({
    queryKey: userQueryKeys.fields(),
    queryFn: api.user.getFields,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useSendFeedback = () => {
  return useMutation({
    mutationFn: api.user.sendFeedback,
    onSuccess: () => {
      toast.success('Feedback sent successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send feedback';
      toast.error(message);
    },
  });
};

// ============================================================================
// EVENTS HOOKS
// ============================================================================

export const useGetAdminEvents = () => {
  return useQuery({
    queryKey: eventsQueryKeys.admin(),
    queryFn: api.events.getAdminEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetAttendees = (eventId?: number) => {
  return useQuery({
    queryKey: eventsQueryKeys.attendees(eventId),
    queryFn: () => api.events.getAttendees(eventId),
    enabled: Boolean(eventId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateOrJoinEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.events.createOrJoinEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.admin() });
      toast.success('Event joined successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to join event';
      toast.error(message);
    },
  });
};

export const useJoinEventByCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.events.joinEventByCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.admin() });
      toast.success('Event joined successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to join event';
      toast.error(message);
    },
  });
};

// ============================================================================
// NETWORKING HOOKS
// ============================================================================

export const useGetNetworksAndConnections = (filters?: NetworkFilters) => {
  return useQuery({
    queryKey: networkingQueryKeys.networksAndConnections(filters),
    queryFn: () => api.networking.getNetworksAndConnections(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useGetNetworkDetails = (networkId: number) => {
  return useQuery({
    queryKey: networkingQueryKeys.networkDetails(networkId),
    queryFn: () => api.networking.getNetworkDetails(networkId),
    enabled: Boolean(networkId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetConnectedUserDetails = (userId: number) => {
  return useQuery({
    queryKey: networkingQueryKeys.connectedUserDetails(userId),
    queryFn: () => api.networking.getConnectedUserDetails(userId),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetNetworkInformation = (networkId: number) => {
  return useQuery({
    queryKey: networkingQueryKeys.networkInformation(networkId),
    queryFn: () => api.networking.getNetworkInformation(networkId),
    enabled: Boolean(networkId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSaveNetworkInformation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.networking.saveNetworkInformation,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: networkingQueryKeys.networkInformation(variables.network) 
      });
      toast.success('Network information saved successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to save network information';
      toast.error(message);
    },
  });
};

export const useCreateNetwork = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.networking.createNetwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: networkingQueryKeys.networksAndConnections() 
      });
      toast.success('Network created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create network';
      toast.error(message);
    },
  });
};

export const useGetReceivedRequests = () => {
  return useQuery({
    queryKey: networkingQueryKeys.receivedRequests(),
    queryFn: api.networking.getReceivedRequests,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useGetSentRequests = () => {
  return useQuery({
    queryKey: networkingQueryKeys.sentRequests(),
    queryFn: api.networking.getSentRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSendNetworkingRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.networking.sendNetworkingRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkingQueryKeys.sentRequests() });
      toast.success('Networking request sent successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send networking request';
      toast.error(message);
    },
  });
};

export const useRespondToNetworkingRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, response, message }: { 
      requestId: number; 
      response: 'accept' | 'reject'; 
      message?: string; 
    }) => api.networking.respondToRequest(requestId, response, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkingQueryKeys.receivedRequests() });
      queryClient.invalidateQueries({ queryKey: networkingQueryKeys.myConnections() });
      toast.success('Request responded to successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to respond to request';
      toast.error(message);
    },
  });
};

export const useGetMyConnections = () => {
  return useQuery({
    queryKey: networkingQueryKeys.myConnections(),
    queryFn: api.networking.getMyConnections,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBrowseUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: networkingQueryKeys.browseUsers(filters),
    queryFn: () => api.networking.browseUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useFilterUsers = () => {
  return useMutation({
    mutationFn: api.networking.filterUsers,
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to filter users';
      toast.error(message);
    },
  });
};

export const useGetNotificationCount = () => {
  return useQuery({
    queryKey: networkingQueryKeys.notificationCount(),
    queryFn: api.networking.getNotificationCount,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useGetQRAnalytics = () => {
  return useQuery({
    queryKey: networkingQueryKeys.qrAnalytics(),
    queryFn: api.networking.getQRAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetConnectionStrength = () => {
  return useQuery({
    queryKey: networkingQueryKeys.connectionStrength(),
    queryFn: api.networking.getConnectionStrength,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetConnectionRecommendations = () => {
  return useQuery({
    queryKey: networkingQueryKeys.connectionRecommendations(),
    queryFn: api.networking.getConnectionRecommendations,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCreateDirectConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.networking.createDirectConnection,
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: networkingQueryKeys.connectionRecommendations() });
      queryClient.invalidateQueries({ queryKey: networkingQueryKeys.connectionStrength() });
      queryClient.invalidateQueries({ queryKey: networkingQueryKeys.myConnections() });
      queryClient.invalidateQueries({ queryKey: networkingQueryKeys.networksAndConnections() });
      queryClient.invalidateQueries({ queryKey: networkingQueryKeys.notificationCount() });
      
      // Force refetch the connections data immediately
      queryClient.refetchQueries({ queryKey: networkingQueryKeys.myConnections() });
      queryClient.refetchQueries({ queryKey: networkingQueryKeys.networksAndConnections() });
    },
  });
};

export const useReportSpam = () => {
  return useMutation({
    mutationFn: api.networking.reportSpam,
    onSuccess: () => {
      toast.success('Spam reported successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to report spam';
      toast.error(message);
    },
  });
};

// ============================================================================
// WALLET HOOKS
// ============================================================================

export const useConnectWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.wallet.connectWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletQueryKeys.connection() });
      toast.success('Wallet connected successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to connect wallet';
      toast.error(message);
    },
  });
};

export const useGetTransactionStatus = (transactionId: string) => {
  return useQuery({
    queryKey: walletQueryKeys.transactionStatus(transactionId),
    queryFn: () => api.wallet.getTransactionStatus(transactionId),
    enabled: Boolean(transactionId),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
};

export const useMockTransaction = () => {
  return useMutation({
    mutationFn: api.wallet.mockTransaction,
    onSuccess: () => {
      toast.success('Mock transaction completed!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to process transaction';
      toast.error(message);
    },
  });
};

export const useDebugWallet = () => {
  return useQuery({
    queryKey: walletQueryKeys.debug(),
    queryFn: api.wallet.debugWallet,
    enabled: false, // Only run when explicitly called
  });
};

// ============================================================================
// FILE UPLOAD HOOKS
// ============================================================================

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ file, key }: { file: File; key: string }) => 
      api.file.uploadFile(file, key),
    onSuccess: () => {
      toast.success('File uploaded successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to upload file';
      toast.error(message);
    },
  });
};

// ============================================================================
// HEALTH CHECK HOOKS
// ============================================================================

export const useNetworkingHealthCheck = () => {
  return useQuery({
    queryKey: ['health-networking'],
    queryFn: api.health.networkingHealthCheck,
    enabled: false, // Only run when explicitly called
  });
};

export const useNetworkingDebug = () => {
  return useQuery({
    queryKey: ['health-debug'],
    queryFn: api.health.networkingDebug,
    enabled: false, // Only run when explicitly called
  });
};
