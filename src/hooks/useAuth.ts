// useAuth Hook - Easy access to auth context
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/types/auth';

/**
 * useAuth Hook
 * Custom hook to access auth context
 * Must be used within AuthProvider
 *
 * @example
 * const { user, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. Make sure your component is wrapped with <AuthProvider>'
    );
  }

  return context;
}

/**
 * Helper hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === 'admin' || false;
}

/**
 * Helper hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Helper hook to check if currently loading auth
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}
