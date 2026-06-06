// Authentication Service - Handles all auth operations with Supabase
import { supabase } from './supabaseClient';
import type {
  User,
  AuthUser,
  SignUpData,
  LoginData,
  AuthError as AuthErrorType,
  AuthErrorCode,
} from '@/types/auth';
import { AuthError, AuthErrorCode as ErrorCode } from '@/types/auth';

/**
 * Authentication Service
 * Handles user signup, login, logout, and profile management
 * Integrates with Supabase Auth and custom user table
 */
export const authService = {
  /**
   * Sign up a new user (Regular User)
   * Creates auth user + custom user profile
   */
  async signup(data: SignUpData): Promise<{ user: User; session: any }> {
    try {
      // Validate input
      if (!data.email || !data.password || !data.username) {
        throw new AuthError(
          ErrorCode.INVALID_CREDENTIALS,
          'Email, password, and username are required'
        );
      }

      if (data.password.length < 8) {
        throw new AuthError(
          ErrorCode.WEAK_PASSWORD,
          'Password must be at least 8 characters long'
        );
      }

      // Create auth user in Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              username: data.username,
              role: 'user', // Default role
            },
          },
        });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new AuthError(
            ErrorCode.USER_ALREADY_EXISTS,
            'Email already registered. Please login or use another email.'
          );
        }
        throw new AuthError(ErrorCode.UNKNOWN_ERROR, authError.message);
      }

      if (!authData.user) {
        throw new AuthError(
          ErrorCode.UNKNOWN_ERROR,
          'User creation failed. Please try again.'
        );
      }

      // Create user profile in public.users table
      const userProfile: Partial<User> = {
        id: authData.user.id,
        email: data.email,
        username: data.username,
        role: 'user',
        is_active: true,
        is_banned: false,
      };

      const { error: profileError } = await supabase
        .from('users')
        .insert([userProfile]);

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new AuthError(
          ErrorCode.UNKNOWN_ERROR,
          'Failed to create user profile. Please try again.'
        );
      }

      return {
        user: userProfile as User,
        session: authData.session,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        ErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Signup failed'
      );
    }
  },

  /**
   * Sign up an admin user (Admin only - should be called from secure context)
   * Creates auth user + custom user profile with admin role
   */
  async signupAdmin(
    data: SignUpData,
    adminSecret?: string
  ): Promise<{ user: User; session: any }> {
    try {
      // In production, verify admin secret or JWT token
      if (!adminSecret) {
        throw new AuthError(
          ErrorCode.FORBIDDEN,
          'Unauthorized: Admin secret required'
        );
      }

      // Validate input
      if (!data.email || !data.password || !data.username) {
        throw new AuthError(
          ErrorCode.INVALID_CREDENTIALS,
          'Email, password, and username are required'
        );
      }

      if (data.password.length < 12) {
        throw new AuthError(
          ErrorCode.WEAK_PASSWORD,
          'Admin password must be at least 12 characters long'
        );
      }

      // Create auth user with admin role
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              username: data.username,
              role: 'admin',
            },
          },
        });

      if (authError) {
        throw new AuthError(ErrorCode.UNKNOWN_ERROR, authError.message);
      }

      if (!authData.user) {
        throw new AuthError(
          ErrorCode.UNKNOWN_ERROR,
          'Admin user creation failed'
        );
      }

      // Create admin profile
      const adminProfile: Partial<User> = {
        id: authData.user.id,
        email: data.email,
        username: data.username,
        role: 'admin',
        is_active: true,
        is_banned: false,
      };

      const { error: profileError } = await supabase
        .from('users')
        .insert([adminProfile]);

      if (profileError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new AuthError(
          ErrorCode.UNKNOWN_ERROR,
          'Failed to create admin profile'
        );
      }

      return {
        user: adminProfile as User,
        session: authData.session,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        ErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Admin signup failed'
      );
    }
  },

  /**
   * Login user (Regular User or Admin)
   * Authenticates with Supabase and fetches user profile
   */
  async login(credentials: LoginData): Promise<{ user: User; session: any }> {
    try {
      if (!credentials.email || !credentials.password) {
        throw new AuthError(
          ErrorCode.INVALID_CREDENTIALS,
          'Email and password are required'
        );
      }

      // Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new AuthError(
            ErrorCode.INVALID_CREDENTIALS,
            'Invalid email or password'
          );
        }
        throw new AuthError(ErrorCode.UNKNOWN_ERROR, error.message);
      }

      if (!data.user) {
        throw new AuthError(
          ErrorCode.USER_NOT_FOUND,
          'User not found after authentication'
        );
      }

      // Fetch user profile from custom table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new AuthError(
          ErrorCode.USER_NOT_FOUND,
          'User profile not found'
        );
      }

      // Check if user is banned
      if (userProfile.is_banned) {
        throw new AuthError(
          ErrorCode.UNAUTHORIZED,
          `Account suspended: ${userProfile.banned_reason || 'Contact support for details'}`
        );
      }

      // Update last_login_at
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);

      return {
        user: userProfile,
        session: data.session,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        ErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  },

  /**
   * Logout current user
   * Clears session and removes tokens
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new AuthError(ErrorCode.UNKNOWN_ERROR, error.message);
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        ErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Logout failed'
      );
    }
  },

  /**
   * Get current authenticated user
   * Returns both auth user and user profile
   */
  async getCurrentUser(): Promise<{
    authUser: AuthUser | null;
    userProfile: User | null;
  }> {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return { authUser: null, userProfile: null };
      }

      // Fetch user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError || !userProfile) {
        return { authUser, userProfile: null };
      }

      return { authUser, userProfile };
    } catch (error) {
      console.error('Error fetching current user:', error);
      return { authUser: null, userProfile: null };
    }
  },

  /**
   * Refresh authentication token
   * Called when access token is about to expire
   */
  async refreshToken(): Promise<any> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw new AuthError(
          ErrorCode.SESSION_EXPIRED,
          'Session expired. Please login again.'
        );
      }

      return data.session;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        ErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Token refresh failed'
      );
    }
  },

  /**
   * Update user profile
   * Updates custom user table (not auth user)
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new AuthError(
          ErrorCode.UNKNOWN_ERROR,
          'Failed to update profile'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        ErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Profile update failed'
      );
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new AuthError(
          ErrorCode.UNKNOWN_ERROR,
          'Failed to send reset email'
        );
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        ErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Password reset email failed'
      );
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      if (!token || !newPassword) {
        throw new AuthError(
          ErrorCode.INVALID_CREDENTIALS,
          'Token and new password are required'
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new AuthError(
          ErrorCode.UNKNOWN_ERROR,
          'Failed to reset password'
        );
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        ErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Password reset failed'
      );
    }
  },

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      return data.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  /**
   * Verify email (after signup)
   * In production, Supabase sends confirmation email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        throw new AuthError(
          ErrorCode.EMAIL_NOT_VERIFIED,
          'Failed to verify email'
        );
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(
        ErrorCode.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Email verification failed'
      );
    }
  },
};
