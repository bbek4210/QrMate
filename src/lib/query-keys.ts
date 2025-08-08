// Query Keys for React Query
export const QUERY_KEYS = {
  // Authentication
  AUTH: {
    TEST: 'auth-test',
  },

  // User
  USER: {
    PROFILE: 'user-profile',
    POSITIONS: 'user-positions',
    FIELDS: 'user-fields',
  },

  // Events
  EVENTS: {
    ALL: 'events-all',
    ADMIN: 'events-admin',
    ATTENDEES: 'events-attendees',
  },

  // Networking
  NETWORKING: {
    NETWORKS_AND_CONNECTIONS: 'networks-and-connections',
    NETWORK_DETAILS: 'network-details',
    CONNECTED_USER_DETAILS: 'connected-user-details',
    NETWORK_INFORMATION: 'network-information',
    RECEIVED_REQUESTS: 'received-requests',
    SENT_REQUESTS: 'sent-requests',
    MY_CONNECTIONS: 'my-connections',
    BROWSE_USERS: 'browse-users',
    NOTIFICATION_COUNT: 'notification-count',
    GET_SELFIE_NOTE: 'get-selfie-note',
  },

  // Wallet
  WALLET: {
    CONNECTION: 'wallet-connection',
    TRANSACTION_STATUS: 'transaction-status',
    DEBUG: 'wallet-debug',
  },

  // Health
  HEALTH: {
    NETWORKING: 'health-networking',
    DEBUG: 'health-debug',
  },
} as const;

// Helper function to create query keys with parameters
export const createQueryKey = <T extends readonly unknown[]>(
  baseKey: string,
  ...params: T
): [string, ...T] => [baseKey, ...params];

// Specific query key helpers
export const userQueryKeys = {
  profile: () => [QUERY_KEYS.USER.PROFILE] as const,
  positions: () => [QUERY_KEYS.USER.POSITIONS] as const,
  fields: () => [QUERY_KEYS.USER.FIELDS] as const,
};

export const networkingQueryKeys = {
  networksAndConnections: (filters?: any) => 
    [QUERY_KEYS.NETWORKING.NETWORKS_AND_CONNECTIONS, filters] as const,
  networkDetails: (networkId: number) => 
    [QUERY_KEYS.NETWORKING.NETWORK_DETAILS, networkId] as const,
  connectedUserDetails: (userId: number) => 
    [QUERY_KEYS.NETWORKING.CONNECTED_USER_DETAILS, userId] as const,
  networkInformation: (networkId: number) => 
    [QUERY_KEYS.NETWORKING.NETWORK_INFORMATION, networkId] as const,
  receivedRequests: () => 
    [QUERY_KEYS.NETWORKING.RECEIVED_REQUESTS] as const,
  sentRequests: () => 
    [QUERY_KEYS.NETWORKING.SENT_REQUESTS] as const,
  myConnections: () => 
    [QUERY_KEYS.NETWORKING.MY_CONNECTIONS] as const,
  browseUsers: (filters?: any) => 
    [QUERY_KEYS.NETWORKING.BROWSE_USERS, filters] as const,
  notificationCount: () => 
    [QUERY_KEYS.NETWORKING.NOTIFICATION_COUNT] as const,
};

export const eventsQueryKeys = {
  all: () => [QUERY_KEYS.EVENTS.ALL] as const,
  admin: () => [QUERY_KEYS.EVENTS.ADMIN] as const,
  attendees: (eventId?: number) => 
    [QUERY_KEYS.EVENTS.ATTENDEES, eventId] as const,
};

export const walletQueryKeys = {
  connection: () => [QUERY_KEYS.WALLET.CONNECTION] as const,
  transactionStatus: (transactionId: string) => 
    [QUERY_KEYS.WALLET.TRANSACTION_STATUS, transactionId] as const,
  debug: () => [QUERY_KEYS.WALLET.DEBUG] as const,
};
