# API Integration Documentation

This document describes the comprehensive API integration system for the QR Mate frontend application.

## Overview

The API integration system provides a clean, type-safe, and efficient way to interact with the Django backend. It includes:

- **TypeScript Types**: Complete type definitions for all API requests and responses
- **API Service Functions**: Centralized API calls with proper error handling
- **React Query Hooks**: Optimized data fetching and caching
- **Authentication Context**: JWT-based authentication management

## File Structure

```
src/
├── types/
│   └── api.ts                 # TypeScript type definitions
├── lib/
│   ├── api.ts                 # API service functions
│   ├── axios.ts               # Axios configuration with interceptors
│   └── query-keys.ts          # React Query key management
├── hooks/
│   ├── api-hooks.ts           # React Query hooks for all endpoints
│   └── ...                    # Legacy hooks (being updated)
└── contexts/
    └── AuthContext.tsx        # Authentication context
```

## Quick Start

### 1. Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login, signup, user, logout } = useAuth();

  const handleLogin = async () => {
    const success = await login('user@example.com', 'password');
    if (success) {
      // Redirect or show success message
    }
  };

  const handleSignup = async () => {
    const success = await signup({
      email: 'user@example.com',
      password: 'password',
      name: 'John Doe',
      username: 'johndoe'
    });
  };

  return (
    <div>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Data Fetching

```tsx
import { useGetUserProfile, useGetFields } from '@/hooks/api-hooks';

function ProfileComponent() {
  const { data: profile, isLoading, error } = useGetUserProfile();
  const { data: fields } = useGetFields();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{profile?.data?.name}</h1>
      <p>{profile?.data?.email}</p>
    </div>
  );
}
```

### 3. Data Mutations

```tsx
import { useUpdateUserProfile, useCreateNetwork } from '@/hooks/api-hooks';

function UpdateProfileComponent() {
  const updateProfile = useUpdateUserProfile();
  const createNetwork = useCreateNetwork();

  const handleUpdate = async () => {
    await updateProfile.mutateAsync({
      name: 'New Name',
      bio: 'Updated bio',
      location: 'New York'
    });
  };

  const handleCreateNetwork = async () => {
    await createNetwork.mutateAsync({
      name: 'My Network',
      description: 'A test network'
    });
  };

  return (
    <div>
      <button 
        onClick={handleUpdate}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
      </button>
    </div>
  );
}
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/signup/` - User registration
- `GET /api/v1/test/` - Test API connection

### User Management

- `GET /api/v1/web/profile/` - Get user profile
- `PUT /api/v1/web/profile/` - Update user profile
- `GET /api/v1/positions/` - Get available positions
- `GET /api/v1/fields/` - Get available fields
- `POST /api/v1/userfeedback/` - Send user feedback

### Events

- `POST /api/v1/event/` - Create or join event
- `GET /api/v1/admin_event/` - Get admin events
- `POST /api/v1/event/join/{code}/` - Join event by code
- `GET /api/v1/attendees/` - Get event attendees

### Networking

- `POST /api/v1/create-a-network/` - Create network
- `GET /api/v1/networks_and_connnections/` - Get networks and connections
- `GET /api/v1/networks_and_connnections/{id}/` - Get network details
- `GET /api/v1/get-network-information/{id}/` - Get network information
- `POST /api/v1/save-network-information/` - Save network information
- `POST /api/v1/networking/send-request/` - Send networking request
- `GET /api/v1/networking/received-requests/` - Get received requests
- `GET /api/v1/networking/sent-requests/` - Get sent requests
- `POST /api/v1/networking/respond/{id}/` - Respond to request
- `GET /api/v1/networking/connections/` - Get my connections
- `GET /api/v1/users/browse/` - Browse users
- `POST /api/v1/users/filter/` - Filter users
- `GET /api/v1/notifications/count/` - Get notification count
- `POST /api/v1/networking/spam-reports/` - Report spam

### Wallet

- `POST /api/v1/wallet/connect/` - Connect wallet
- `GET /api/v1/transaction/status/{id}/` - Get transaction status
- `POST /api/v1/transaction/mock/` - Mock transaction
- `GET /api/v1/wallet/debug/` - Debug wallet

### File Upload

- `POST /api/v1/upload/file/` - Upload file

### Health Checks

- `GET /api/v1/networking/health-check/` - Networking health check
- `GET /api/v1/networking/debug/` - Networking debug

## Available Hooks

### Query Hooks (Data Fetching)

```tsx
// User
useGetUserProfile()           // Get current user profile
useGetUserPositions()         // Get available positions
useGetFields()               // Get available fields

// Events
useGetAdminEvents()          // Get admin events
useGetAttendees(eventId)     // Get event attendees

// Networking
useGetNetworksAndConnections(filters)  // Get networks and connections
useGetNetworkDetails(networkId)        // Get specific network details
useGetConnectedUserDetails(userId)     // Get connected user details
useGetNetworkInformation(networkId)    // Get network information
useGetReceivedRequests()               // Get received networking requests
useGetSentRequests()                   // Get sent networking requests
useGetMyConnections()                  // Get my connections
useBrowseUsers(filters)                // Browse users
useGetNotificationCount()              // Get notification count

// Wallet
useGetTransactionStatus(transactionId) // Get transaction status
useDebugWallet()                       // Debug wallet

// Health
useNetworkingHealthCheck()             // Health check
useNetworkingDebug()                   // Debug info
```

### Mutation Hooks (Data Updates)

```tsx
// User
useUpdateUserProfile()       // Update user profile
useSendFeedback()           // Send user feedback

// Events
useCreateOrJoinEvent()      // Create or join event
useJoinEventByCode()        // Join event by code

// Networking
useCreateNetwork()          // Create network
useSaveNetworkInformation() // Save network information
useSendNetworkingRequest()  // Send networking request
useRespondToNetworkingRequest() // Respond to request
useFilterUsers()            // Filter users
useReportSpam()             // Report spam

// Wallet
useConnectWallet()          // Connect wallet
useMockTransaction()        // Mock transaction

// File Upload
useUploadFile()             // Upload file
```

## TypeScript Types

All API types are defined in `src/types/api.ts`:

```tsx
// User types
interface User {
  id: number;
  uuid: string;
  email: string;
  name: string;
  username: string;
  photo_url?: string;
  is_active: boolean;
  is_staff: boolean;
}

interface UserWithProfile extends User {
  user_profile: UserProfile;
  user_fields?: UserField[];
}

// API Response wrapper
interface ApiResponse<T = any> {
  status: 'SUCCESS' | 'ERROR';
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Request types
interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  username: string;
}

interface UpdateProfileRequest {
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  // ... more fields
}
```

## Error Handling

The system includes comprehensive error handling:

1. **Axios Interceptors**: Automatically handle token expiration and redirect to login
2. **React Query**: Built-in error states and retry logic
3. **Toast Notifications**: User-friendly error messages
4. **Type Safety**: TypeScript prevents many runtime errors

```tsx
const { data, error, isLoading } = useGetUserProfile();

if (error) {
  // Error is automatically handled with toast notification
  return <div>Something went wrong</div>;
}
```

## Caching Strategy

React Query provides intelligent caching:

- **Stale Time**: Data is considered fresh for a configurable period
- **Cache Time**: Data remains in cache even when not actively used
- **Background Refetching**: Data is refreshed in the background
- **Optimistic Updates**: UI updates immediately, then syncs with server

```tsx
// Example with custom caching
const { data } = useQuery({
  queryKey: userQueryKeys.profile(),
  queryFn: api.user.getProfile,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## Best Practices

### 1. Use the Hooks

Always use the provided hooks instead of calling API functions directly:

```tsx
// ✅ Good
const { data, isLoading } = useGetUserProfile();

// ❌ Bad
const [data, setData] = useState(null);
useEffect(() => {
  api.user.getProfile().then(setData);
}, []);
```

### 2. Handle Loading States

Always provide loading states for better UX:

```tsx
const { data, isLoading, error } = useGetUserProfile();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
```

### 3. Use Mutations for Updates

Use mutation hooks for data updates:

```tsx
const updateProfile = useUpdateUserProfile();

const handleUpdate = async () => {
  try {
    await updateProfile.mutateAsync(newData);
    // Success is handled automatically
  } catch (error) {
    // Error is handled automatically
  }
};
```

### 4. Invalidate Queries

Mutations automatically invalidate related queries, but you can also do it manually:

```tsx
const queryClient = useQueryClient();

const updateProfile = useUpdateUserProfile();
// This automatically invalidates user profile queries
```

## Testing

The API integration can be tested using the example component:

```tsx
import ApiIntegrationExample from '@/components/ApiIntegrationExample';

// Add to your page to test all API endpoints
<ApiIntegrationExample />
```

## Migration from Legacy Code

If you have existing code using direct axios calls, here's how to migrate:

### Before (Legacy)
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  axios.get('/api/v1/web/profile/')
    .then(response => setData(response.data))
    .finally(() => setLoading(false));
}, []);
```

### After (New System)
```tsx
const { data, isLoading } = useGetUserProfile();
```

The new system provides:
- Automatic caching
- Error handling
- Loading states
- Type safety
- Background refetching
- Optimistic updates

## Environment Configuration

Make sure your environment variables are set correctly:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The API base URL is automatically configured to use `/api/v1/` as the prefix.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend allows requests from your frontend domain
2. **Authentication Errors**: Check that the JWT token is being sent correctly
3. **Type Errors**: Make sure all API responses match the TypeScript types

### Debug Mode

Enable debug logging by checking the browser console. All API requests and responses are logged to Discord for debugging purposes.

### Health Checks

Use the health check hooks to verify API connectivity:

```tsx
const { data: health } = useNetworkingHealthCheck();
```

This integration provides a robust, type-safe, and efficient way to interact with your Django backend API. The system is designed to be scalable, maintainable, and developer-friendly.
