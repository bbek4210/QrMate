import axiosInstance from './axios';
import {
  ApiResponse,
  User,
  UserWithProfile,
  UserProfile,
  Field,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  BaseEvent,
  UserEvent,
  UserNetwork,
  NetworkConnection,
  NetworkingRequest,
  MeetingInformation,
  WalletConnection,
  UserFeedback,
  FileUploadResponse,
  TransactionStatus,
  NotificationCount,
  NetworkFilters,
  UserFilters,
  PaginatedResponse,
  UpdateProfileRequest,
} from '@/types/api';

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authAPI = {
  // Login user
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/auth/login/', credentials);
    return response.data;
  },

  // Signup user
  signup: async (userData: SignupRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/auth/signup/', userData);
    return response.data;
  },

  // Test API endpoint
  test: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get('/test/');
    return response.data;
  },
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  // Get user profile
  getProfile: async (): Promise<ApiResponse<UserWithProfile>> => {
    const response = await axiosInstance.get('/web/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: UpdateProfileRequest): Promise<ApiResponse<UserWithProfile>> => {
    const response = await axiosInstance.put('/web/profile/', profileData);
    return response.data;
  },

  // Get user positions
  getPositions: async (): Promise<ApiResponse<string[]>> => {
    const response = await axiosInstance.get('/positions/');
    return response.data;
  },

  // Send user feedback
  sendFeedback: async (feedbackData: FormData): Promise<ApiResponse<UserFeedback>> => {
    const response = await axiosInstance.post('/userfeedback/', feedbackData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all fields
  getFields: async (): Promise<Field[]> => {
    const response = await axiosInstance.get('/fields/');
    return response.data;
  },
};

// ============================================================================
// EVENTS API
// ============================================================================

export const eventsAPI = {
  // Create or join event
  createOrJoinEvent: async (eventData: any): Promise<ApiResponse<UserEvent>> => {
    const response = await axiosInstance.post('/event/', eventData);
    return response.data;
  },

  // Get admin events
  getAdminEvents: async (): Promise<ApiResponse<UserEvent[]>> => {
    const response = await axiosInstance.get('/admin_event/');
    return response.data;
  },

  // Join event by code
  joinEventByCode: async (code: string): Promise<ApiResponse<UserEvent>> => {
    const response = await axiosInstance.post(`/event/join/${code}/`);
    return response.data;
  },

  // Get attendees list
  getAttendees: async (eventId?: number): Promise<ApiResponse<User[]>> => {
    const params = eventId ? `?event=${eventId}` : '';
    const response = await axiosInstance.get(`/attendees/${params}`);
    return response.data;
  },
};

// ============================================================================
// NETWORKING API
// ============================================================================

export const networkingAPI = {
  // Create network
  createNetwork: async (networkData: any): Promise<ApiResponse<UserNetwork>> => {
    const response = await axiosInstance.post('/create-a-network/', networkData);
    return response.data;
  },

  // Get networks and connections
  getNetworksAndConnections: async (filters?: NetworkFilters): Promise<ApiResponse<NetworkConnection[]>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const response = await axiosInstance.get(`/networks_and_connnections/?${params.toString()}`);
    return response.data;
  },

  // Get network details
  getNetworkDetails: async (networkId: number): Promise<ApiResponse<UserNetwork>> => {
    const response = await axiosInstance.get(`/networks_and_connnections/${networkId}/`);
    return response.data;
  },

  // Get connected user details
  getConnectedUserDetails: async (connectedUserId: number): Promise<ApiResponse<UserWithProfile>> => {
    const response = await axiosInstance.get(`/networks_and_connnections/${connectedUserId}/`);
    return response.data;
  },

  // Get network information
  getNetworkInformation: async (networkId: number): Promise<ApiResponse<MeetingInformation>> => {
    const response = await axiosInstance.get(`/get-network-information/${networkId}/`);
    return response.data;
  },

  // Save network information
  saveNetworkInformation: async (meetingData: any): Promise<ApiResponse<MeetingInformation>> => {
    const response = await axiosInstance.post('/save-network-information/', meetingData);
    return response.data;
  },

  // Send networking request
  sendNetworkingRequest: async (requestData: any): Promise<ApiResponse<NetworkingRequest>> => {
    const response = await axiosInstance.post('/networking/send-request/', requestData);
    return response.data;
  },

  // Get received networking requests
  getReceivedRequests: async (): Promise<ApiResponse<NetworkingRequest[]>> => {
    const response = await axiosInstance.get('/networking/received-requests/');
    return response.data;
  },

  // Get sent networking requests
  getSentRequests: async (): Promise<ApiResponse<NetworkingRequest[]>> => {
    const response = await axiosInstance.get('/networking/sent-requests/');
    return response.data;
  },

  // Respond to networking request
  respondToRequest: async (requestId: number, response: 'accept' | 'reject', message?: string): Promise<ApiResponse> => {
    const responseData = await axiosInstance.post(`/networking/respond/${requestId}/`, {
      response,
      message,
    });
    return responseData.data;
  },

  // Get my connections
  getMyConnections: async (): Promise<ApiResponse<UserWithProfile[]>> => {
    const response = await axiosInstance.get('/networking/connections/');
    return response.data;
  },

  // Browse users
  browseUsers: async (filters?: UserFilters): Promise<ApiResponse<PaginatedResponse<UserWithProfile>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const response = await axiosInstance.get(`/users/browse/?${params.toString()}`);
    return response.data;
  },

  // Filter users
  filterUsers: async (filters: UserFilters): Promise<ApiResponse<PaginatedResponse<UserWithProfile>>> => {
    const response = await axiosInstance.post('/users/filter/', filters);
    return response.data;
  },

  // Get notification count
  getNotificationCount: async (): Promise<ApiResponse<NotificationCount>> => {
    const response = await axiosInstance.get('/notifications/count/');
    return response.data;
  },

  // Get QR analytics
  getQRAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get('/qr-analytics/');
    return response.data;
  },

  // Get connection strength analysis
  getConnectionStrength: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get('/connection-strength/');
    return response.data;
  },

  // Get connection recommendations
  getConnectionRecommendations: async (): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get('/connection-recommendations/');
    return response.data;
  },

  // Create direct connection (for 75%+ similarity)
  createDirectConnection: async (targetUserId: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post(`/direct-connection/${targetUserId}/`);
    return response.data;
  },

  // Report spam
  reportSpam: async (reportData: any): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/networking/spam-reports/', reportData);
    return response.data;
  },
};

// ============================================================================
// WALLET API
// ============================================================================

export const walletAPI = {
  // Connect wallet
  connectWallet: async (walletData: any): Promise<ApiResponse<WalletConnection>> => {
    const response = await axiosInstance.post('/wallet/connect/', walletData);
    return response.data;
  },

  // Get transaction status
  getTransactionStatus: async (transactionId: string): Promise<ApiResponse<TransactionStatus>> => {
    const response = await axiosInstance.get(`/transaction/status/${transactionId}/`);
    return response.data;
  },

  // Mock transaction
  mockTransaction: async (transactionData: any): Promise<ApiResponse<TransactionStatus>> => {
    const response = await axiosInstance.post('/transaction/mock/', transactionData);
    return response.data;
  },

  // Debug wallet
  debugWallet: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get('/wallet/debug/');
    return response.data;
  },
};

// ============================================================================
// FILE UPLOAD API
// ============================================================================

export const fileAPI = {
  // Upload file
  uploadFile: async (file: File, key: string): Promise<ApiResponse<FileUploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    const response = await axiosInstance.post('/upload/file/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ============================================================================
// HEALTH CHECK API
// ============================================================================

export const healthAPI = {
  // Networking health check
  networkingHealthCheck: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get('/networking/health-check/');
    return response.data;
  },

  // Networking debug
  networkingDebug: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get('/networking/debug/');
    return response.data;
  },
};

// ============================================================================
// EXPORT ALL APIs
// ============================================================================

export const api = {
  auth: authAPI,
  user: userAPI,
  events: eventsAPI,
  networking: networkingAPI,
  wallet: walletAPI,
  file: fileAPI,
  health: healthAPI,
};
