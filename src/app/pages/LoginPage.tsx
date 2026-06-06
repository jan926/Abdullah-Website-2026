// LoginPage Component - User login
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { LoginData } from '@/types/auth';

/**
 * LoginPage
 * User login form with email/password authentication
 * Includes links to signup and password reset
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formError) setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }

    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email');
      return false;
    }

    if (!formData.password) {
      setFormError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      // Error is handled by authError from context
      console.error('Login error:', err);
    }
  };

  const displayError = formError || authError;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-neon-cyan/20 rounded-full blur-3xl"></div>
      </div>

      {/* Form container */}
      <div className="relative w-full max-w-md">
        <div className="glassmorphic-card p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-text-primary">
              Welcome Back
            </h1>
            <p className="text-text-secondary">
              Sign in to your AQ Gaming Hub account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {displayError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {displayError}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-bg-secondary/50 border border-neon-purple/30 rounded-lg px-4 py-2 text-text-primary placeholder-text-tertiary focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-colors"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-bg-secondary/50 border border-neon-purple/30 rounded-lg px-4 py-2 text-text-primary placeholder-text-tertiary focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-neon-cyan transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neon-purple/30 accent-neon-purple"
                  disabled={isLoading}
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-neon-cyan hover:text-neon-cyan/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-text-tertiary/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-secondary text-text-secondary">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Signup Link */}
          <Link
            to="/signup"
            className="w-full block text-center py-2 px-4 border border-neon-cyan/50 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
          >
            Create Account
          </Link>

          {/* Admin Login Link */}
          <div className="text-center pt-4 border-t border-text-tertiary/10">
            <p className="text-text-secondary text-sm mb-2">Are you an admin?</p>
            <Link
              to="/admin/login"
              className="text-neon-purple hover:text-neon-purple/80 text-sm transition-colors"
            >
              Admin Portal →
            </Link>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="text-center mt-6">
          <p className="text-text-tertiary text-xs">
            AQ Gaming Hub © 2026 | Secure & Verified
          </p>
        </div>
      </div>
    </div>
  );
}
