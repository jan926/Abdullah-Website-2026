// Protected Routes - Access control for admin and user routes
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/app/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Redirects to login if not authenticated
 * Redirects to unauthorized if admin-only and user is not admin
 *
 * @param children - Component to render if authorized
 * @param requireAdmin - If true, only admins can access
 * @param fallback - Loading component to show while checking auth
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  fallback = <LoadingSpinner />,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();

  // Show loading state while checking auth
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin route but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authorized
  return <>{children}</>;
};

/**
 * AdminRoute Component
 * Wrapper specifically for admin-only routes
 *
 * @param children - Component to render if user is admin
 * @param fallback - Loading component
 */
export const AdminRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = <LoadingSpinner />,
}) => {
  return (
    <ProtectedRoute requireAdmin={true} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * PublicRoute Component
 * Routes that should redirect to dashboard if already logged in
 *
 * @param children - Component to render
 */
export const PublicRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = <LoadingSpinner />,
}) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  // Already authenticated - redirect to appropriate dashboard
  if (isAuthenticated) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/'} replace />;
  }

  return <>{children}</>;
};
