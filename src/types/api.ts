// API Response Types
export interface ApiResponse<T = any> {
  status: 'SUCCESS' | 'ERROR';
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// User Types
export interface User {
  id: number;
  uuid: string;
  email: string;
  name: string;
  username: string;
  photo_url?: string;
  is_active: boolean;
  is_staff: boolean;
  is_deleted?: boolean;
}

export interface UserProfile {
  bio?: string;
  position?: string;
  project_name?: string;
  city?: string;
  linkedin_url?: string;
  twitter_account?: string;
  email?: string;
  company_name?: string;
  wallet_address?: string;
  telegram_account?: string;
  user_fields?: UserField[];
}

export interface UserWithProfile extends User {
  user_profile: UserProfile;
  user_fields?: UserField[];
}

// API Response structure for user profile endpoint
export interface UserProfileResponse {
  user: User;
  profile: UserProfile;
  fields: UserField[];
}

export interface UserField {
  id: number;
  field: Field;
  user: number;
}

export interface Field {
  id: number;
  name: string;
  category?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Event Types
export interface BaseEvent {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserEvent {
  id: number;
  user: number;
  event: BaseEvent;
  joined_at: string;
  is_organizer: boolean;
}

// Network Types
export interface UserNetwork {
  id: number;
  user: number;
  name: string;
  description?: string;
  event?: BaseEvent;
  created_at: string;
  updated_at: string;
}

export interface NetworkConnection {
  id: number;
  network: UserNetwork;
  connected_user: UserWithProfile;
  connection_date: string;
  notes?: string;
  tags?: string[];
}

export interface NetworkingRequest {
  id: number;
  sender: User;
  receiver: User;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Meeting Information Types
export interface MeetingInformation {
  id: number;
  network: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  attendees: User[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Wallet Types
export interface WalletConnection {
  id: number;
  user: number;
  wallet_address: string;
  wallet_type: string;
  is_verified: boolean;
  created_at: string;
}

// Feedback Types
export interface UserFeedback {
  id: number;
  user: number;
  subject: string;
  message: string;
  rating?: number;
  category?: string;
  created_at: string;
}

// File Upload Types
export interface FileUploadResponse {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

// Transaction Types
export interface TransactionStatus {
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
  amount?: number;
  currency?: string;
  timestamp: string;
}

// Notification Types
export interface NotificationCount {
  count: number;
  unread_count: number;
}

// API Error Types
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// Query Parameters Types
export interface NetworkFilters {
  event?: string;
  position?: string;
  city?: string;
  field?: string;
  page?: number;
  page_size?: number;
}

export interface UserFilters {
  search?: string;
  field?: string;
  location?: string;
  page?: number;
  page_size?: number;
}

// Pagination Types
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Update Profile Types
export interface UpdateProfileRequest {
  name?: string;
  username?: string;
  email?: string;
  photo_url?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  company?: string;
  position?: string;
  industry?: string;
  experience_years?: number;
  skills?: string[];
  interests?: string[];
  languages?: string[];
  education?: string;
  certifications?: string[];
  achievements?: string[];
  social_links?: Record<string, string>;
  preferences?: Record<string, any>;
}
