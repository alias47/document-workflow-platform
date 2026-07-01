'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import type { ApiResponse } from '@/types/api';

import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';
import { http } from '@/lib/http';

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Password must be 12+ chars with uppercase, lowercase, digit, special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;

    if (!passwordRegex.test(newPassword)) {
      setError(
        'Password must be at least 12 characters and contain uppercase, lowercase, digit, and special character (!@#$%^&*()_+).',
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must differ from current password.');
      return;
    }

    setLoading(true);
    try {
      await http.post<ApiResponse<null>>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast({
        type: 'success',
        title: 'Password changed',
        message: 'Please sign in with your new password.',
      });
      await logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <div className="login-panel">
        <div className="login-logo">
          <div className="login-logo__icon">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" aria-hidden="true">
              <path
                d="M3.5 5h12M3.5 9.5h8M3.5 14h10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="login-logo__name">EduFlow</span>
        </div>

        <h1 className="login-heading">Change your password</h1>
        <p className="login-subheading">You must set a new password before continuing.</p>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-fields">
            <div>
              <label htmlFor="currentPassword" className="field-label">
                Current Password
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="field-input pr-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((show) => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="newPassword" className="field-label">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="field-input pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((show) => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="field-label">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="field-input pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!currentPassword || !newPassword || !confirmPassword || loading}
            className="btn-login"
            aria-busy={loading}
          >
            {loading ? 'Saving…' : 'Set New Password'}
          </button>
        </form>
      </div>

      <div className="login-illustration" aria-hidden="true">
        <div className="illus-circle-1" />
        <div className="illus-circle-2" />
      </div>
    </div>
  );
}
