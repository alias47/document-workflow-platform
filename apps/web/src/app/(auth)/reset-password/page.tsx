'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useToast } from '@/components/ui/toast';

interface Requirement {
  key: string;
  label: string;
  test: (v: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  { key: 'length', label: 'At least 12 characters', test: (v) => v.length >= 12 },
  { key: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'number', label: 'One number', test: (v) => /[0-9]/.test(v) },
  { key: 'special', label: 'One special character', test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

interface StrengthInfo {
  width: string;
  color: string;
  label: string;
  labelColor: string;
}

function getStrength(value: string): StrengthInfo {
  const met = REQUIREMENTS.filter((r) => r.test(value)).length;
  if (met <= 1) return { width: '25%', color: '#EF4444', label: 'Weak', labelColor: '#EF4444' };
  if (met === 2) return { width: '50%', color: '#F59E0B', label: 'Fair', labelColor: '#F59E0B' };
  if (met === 3) return { width: '75%', color: '#3B82F6', label: 'Good', labelColor: '#3B82F6' };
  return { width: '100%', color: '#22C55E', label: 'Strong', labelColor: '#22C55E' };
}

const EYE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EYE_OFF_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = getStrength(newPw);
  const requirementResults = REQUIREMENTS.map((r) => ({ ...r, met: r.test(newPw) }));
  const confirmMatch = confirm.length > 0 && newPw === confirm;
  const confirmMismatch = confirm.length > 0 && newPw !== confirm;

  async function handleSubmit() {
    setError('');
    if (!currentPw) {
      setError('Please enter your current password.');
      return;
    }
    if (!newPw) {
      setError('Please enter a new password.');
      return;
    }
    if (newPw.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (newPw !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast({
      type: 'success',
      title: 'Password changed!',
      message: 'You can now sign in with your new password.',
    });
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    padding: '10px 42px 10px 14px',
    background: '#F8FAFC',
    border: `1.5px solid ${hasError ? '#EF4444' : '#E2E8F0'}`,
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  });

  const toggleBtnStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '18px',
            boxShadow: '0 10px 15px rgba(15, 23, 42, 0.07), 0 4px 6px rgba(15, 23, 42, 0.04)',
            padding: '32px',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: '#2563EB',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 19 19" fill="none" aria-hidden="true">
                <path
                  d="M3.5 5h12M3.5 9.5h8M3.5 14h10"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.3px',
              }}
            >
              EduFlow
            </span>
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.5px',
              marginBottom: '4px',
            }}
          >
            Change password
          </h1>
          <p
            style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.7, marginBottom: '24px' }}
          >
            Choose a new, strong password for your account.
          </p>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                padding: '12px 16px',
                background: '#FFE4E6',
                border: '1px solid #FECDD3',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}
          >
            {/* Current password */}
            <div>
              <label
                htmlFor="cp-current"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0F172A',
                  marginBottom: '6px',
                }}
              >
                Current password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cp-current"
                  name="current_password"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={currentPw}
                  onChange={(e) => {
                    setCurrentPw(e.target.value);
                    if (error) setError('');
                  }}
                  style={inputStyle()}
                />
                <button
                  type="button"
                  style={toggleBtnStyle}
                  onClick={() => setShowCurrent((v) => !v)}
                >
                  {showCurrent ? EYE_OFF_ICON : EYE_ICON}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label
                htmlFor="cp-new"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0F172A',
                  marginBottom: '6px',
                }}
              >
                New password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cp-new"
                  name="new_password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={newPw}
                  onChange={(e) => {
                    setNewPw(e.target.value);
                    if (error) setError('');
                  }}
                  style={inputStyle()}
                />
                <button type="button" style={toggleBtnStyle} onClick={() => setShowNew((v) => !v)}>
                  {showNew ? EYE_OFF_ICON : EYE_ICON}
                </button>
              </div>

              {/* Strength bar */}
              {newPw.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div
                    style={{
                      height: '4px',
                      background: '#E2E8F0',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: strength.width,
                        background: strength.color,
                        transition: 'width 0.3s',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}
                  >
                    <span style={{ fontSize: '11px', color: strength.labelColor }}>
                      {strength.label}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Min. 12 characters</span>
                  </div>

                  {/* Requirements checklist */}
                  <div style={{ marginTop: '8px' }}>
                    {requirementResults.map((r) => (
                      <div
                        key={r.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11.5px',
                          color: r.met ? '#16A34A' : '#94A3B8',
                          marginTop: '4px',
                          transition: 'color 0.15s',
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={r.met ? '#16A34A' : 'currentColor'}
                          strokeWidth="2.5"
                        >
                          {r.met ? (
                            <polyline points="20 6 9 17 4 12" />
                          ) : (
                            <circle cx="12" cy="12" r="10" />
                          )}
                        </svg>
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="cp-confirm"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0F172A',
                  marginBottom: '6px',
                }}
              >
                Confirm new password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="cp-confirm"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (error) setError('');
                  }}
                  style={{
                    ...inputStyle(),
                    borderColor: confirmMatch ? '#16A34A' : confirmMismatch ? '#EF4444' : '#E2E8F0',
                  }}
                />
                <button
                  type="button"
                  style={toggleBtnStyle}
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? EYE_OFF_ICON : EYE_ICON}
                </button>
              </div>
              {confirm.length > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    display: 'block',
                    marginTop: '4px',
                    color: confirmMatch ? '#16A34A' : '#DC2626',
                  }}
                >
                  {confirmMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              background: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563EB';
            }}
          >
            {loading ? 'Changing…' : 'Change password'}
          </button>

          <Link
            href="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: '12.5px',
              color: '#64748B',
              marginTop: '20px',
              textDecoration: 'none',
            }}
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
