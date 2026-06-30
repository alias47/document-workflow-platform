'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useToast } from '@/components/ui/toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState('');

  function validate(): boolean {
    if (!email) {
      setEmailError('Please enter your email address.');
      return false;
    }
    if (!EMAIL_RE.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSentTo(email);
    setSubmitted(true);
  }

  async function handleResend() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast({ type: 'info', title: 'Email resent', message: `Reset link sent again to ${sentTo}.` });
  }

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

          {submitted ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: '#DCFCE7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#16A34A',
                }}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#0F172A',
                  marginBottom: '8px',
                }}
              >
                Check your email
              </h2>
              <p
                style={{
                  fontSize: '12.5px',
                  color: '#64748B',
                  lineHeight: 1.7,
                  marginBottom: '24px',
                }}
              >
                We&apos;ve sent a password reset link to{' '}
                <strong style={{ color: '#0F172A' }}>{sentTo}</strong>. The link will expire in 30
                minutes.
              </p>
              <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button
                  type="button"
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 'inherit',
                    padding: 0,
                    opacity: loading ? 0.5 : 1,
                  }}
                  onClick={handleResend}
                >
                  resend the email
                </button>
                .
              </p>
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
          ) : (
            /* Default state */
            <>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.5px',
                  marginBottom: '4px',
                }}
              >
                Forgot password?
              </h1>
              <p
                style={{
                  fontSize: '12.5px',
                  color: '#64748B',
                  lineHeight: 1.7,
                  marginBottom: '24px',
                }}
              >
                Enter the email address you use to sign in. We&apos;ll send a reset link to your
                inbox.
              </p>

              {/* Error banner */}
              {emailError && (
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
                  {emailError}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <label
                    htmlFor="fp-email"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: '6px',
                    }}
                  >
                    Email address
                  </label>
                  <input
                    id="fp-email"
                    name="email"
                    type="email"
                    placeholder="you@consultancy.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      border: emailError ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#2563EB';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = emailError ? '#EF4444' : '#E2E8F0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
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
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
