// Authentication related types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  is_active: boolean;
  is_banned: boolean;
  banned_reason?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  aud: string;
  role?: string;
  email_confirmed_at?: string;
  phone_verified_at?: string;
  sign_in_provider?: string;
  last_sign_in_at?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: Record<string, any>;
  identities?: Array<{
    identity_id: string;
    id: string;
    user_id: string;
    identity_data?: Record<string, any>;
    provider: string;
    last_sign_in_at?: string;
    created_at?: string;
    updated_at?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    token_type: string;
  } | null;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (credentials: LoginData) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
}

export interface AdminAuthContextType extends AuthContextType {
  isAdmin: boolean;
  requireAdmin: (callback: () => void) => void;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
