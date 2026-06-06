// UnauthorizedPage Component - 403 Access Denied
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * UnauthorizedPage
 * Shown when user tries to access admin-only routes without proper role
 */
export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative text-center max-w-md">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            403
          </h1>
        </div>

        {/* Error Message */}
        <div className="space-y-3 mb-8">
          <h2 className="text-3xl font-bold text-text-primary">
            Access Denied
          </h2>
          <p className="text-text-secondary">
            You do not have permission to access this resource.
          </p>
          {user && (
            <p className="text-xs text-text-tertiary">
              Current role: <span className="text-neon-cyan">{user.role}</span>
            </p>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 text-sm">
          <p className="text-red-400">
            If you believe you should have access to this area, please contact the administrator.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-block px-6 py-2 border border-neon-purple/50 text-neon-purple rounded-lg hover:bg-neon-purple/10 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
