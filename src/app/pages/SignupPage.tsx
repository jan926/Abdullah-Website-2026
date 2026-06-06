// SignupPage Component - User registration
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { SignUpData } from '@/types/auth';

/**
 * SignupPage
 * User registration form with email/password
 * Includes validation and error handling
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error: authError } = useAuth();

  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    username: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (!formData.username.trim()) {
      setFormError('Username is required');
      return false;
    }

    if (formData.username.length < 3) {
      setFormError('Username must be at least 3 characters');
      return false;
    }

    if (formData.username.length > 30) {
      setFormError('Username must be at most 30 characters');
      return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setFormError('Username can only contain letters, numbers, underscores, and hyphens');
      return false;
    }

    if (!formData.password) {
      setFormError('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setFormError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      setFormError('Password must contain at least one lowercase letter');
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setFormError('Password must contain at least one number');
      return false;
    }

    if (formData.password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    if (!agreeToTerms) {
      setFormError('You must agree to the Terms of Service');
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
      await signup(formData);
      // Redirect to verification page or login
      navigate('/verify-email', {
        state: { email: formData.email },
      });
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  const displayError = formError || authError;

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return { strength, max: 6 };
  };

  const passwordStrength = getPasswordStrength();
  const strengthPercentage = (passwordStrength.strength / passwordStrength.max) * 100;
  const strengthColor =
    strengthPercentage < 33 ? 'bg-red-500' : strengthPercentage < 66 ? 'bg-yellow-500' : 'bg-green-500';

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
              Join AQ Gaming Hub
            </h1>
            <p className="text-text-secondary">
              Create your account and start gaming
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

            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="gamer_name"
                className="w-full bg-bg-secondary/50 border border-neon-purple/30 rounded-lg px-4 py-2 text-text-primary placeholder-text-tertiary focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-colors"
                disabled={isLoading}
              />
              <p className="text-xs text-text-tertiary mt-1">
                3-30 characters, letters, numbers, hyphens, and underscores only
              </p>
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-bg-secondary/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${strengthColor}`}
                      style={{ width: `${strengthPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    Strength:{' '}
                    {strengthPercentage < 33
                      ? 'Weak'
                      : strengthPercentage < 66
                        ? 'Medium'
                        : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bg-secondary/50 border border-neon-purple/30 rounded-lg px-4 py-2 text-text-primary placeholder-text-tertiary focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-neon-cyan transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-3 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 rounded border-neon-purple/30 accent-neon-purple mt-0.5"
                disabled={isLoading}
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="text-neon-cyan hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-neon-cyan hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-text-tertiary/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-secondary text-text-secondary">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full block text-center py-2 px-4 border border-neon-cyan/50 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
          >
            Sign In
          </Link>
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
