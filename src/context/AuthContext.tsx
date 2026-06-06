// Authentication Context - Global auth state management
import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { User, LoginData, SignUpData, AuthContextType } from '@/types/auth';
import { authService } from '@/services/authService';
import { supabase } from '@/services/supabaseClient';

/**
 * AuthContext
 * Provides authentication state and methods to entire app
 * Handles session management, token refresh, and user profile
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 * Wraps the app to provide auth functionality
 * Handles session persistence and auto-refresh
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state on mount
   * Check if user has valid session
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { authUser: currentAuthUser, userProfile } =
          await authService.getCurrentUser();

        if (currentAuthUser && userProfile) {
          setAuthUser(currentAuthUser);
          setUser(userProfile);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err.message : 'Auth initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const { authUser: newAuthUser, userProfile } =
              await authService.getCurrentUser();
            if (newAuthUser && userProfile) {
              setAuthUser(newAuthUser);
              setUser(userProfile);
            }
          } catch (err) {
            console.error('Error updating auth state:', err);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAuthUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setAuthUser(session.user || null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginData) => {
    try {
      setError(null);
      setIsLoading(true);

      const { user: loginUser, session } = await authService.login(credentials);
      setUser(loginUser);
      setAuthUser(session?.user || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Signup user
   */
  const signup = useCallback(async (data: SignUpData) => {
    try {
      setError(null);
      setIsLoading(true);

      const { user: signupUser, session } = await authService.signup(data);
      setUser(signupUser);
      setAuthUser(session?.user || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      await authService.logout();
      setUser(null);
      setAuthUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      try {
        if (!user) {
          throw new Error('No user logged in');
        }

        setError(null);
        setIsLoading(true);

        const updatedUser = await authService.updateProfile(user.id, updates);
        setUser(updatedUser);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Profile update failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async () => {
    try {
      setError(null);
      const session = await authService.refreshToken();

      if (session?.user) {
        setAuthUser(session.user);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Token refresh failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const value: AuthContextType = {
    user,
    authUser,
    isLoading,
    isAuthenticated: !!user && !!authUser,
    userRole: user?.role || null,
    login,
    signup,
    logout,
    updateProfile,
    refreshToken,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
