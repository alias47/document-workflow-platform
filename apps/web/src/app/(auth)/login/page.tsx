'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/use-auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const isValid = EMAIL_RE.test(email) && password.length > 0;

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = 'Email address is required.';
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { mustChangePassword } = await login(email, password);
      if (mustChangePassword) {
        toast({
          type: 'success',
          title: 'Signed in',
          message: 'Please change your password to continue.',
        });
        router.push('/change-password');
      } else {
        toast({
          type: 'success',
          title: 'Signed in',
          message: 'Redirecting to dashboard...',
        });
        router.push('/dashboard');
      }
    } catch (err) {
      const status = (err as { status?: number })?.status;
      toast({
        type: 'error',
        title: 'Sign in failed',
        message:
          status === 401 || status === 400
            ? 'Invalid email or password.'
            : err instanceof Error
              ? err.message
              : 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  function prefill(role: 'admin' | 'applicant') {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('NewPass@1234!');
    } else {
      setEmail('applicant@example.com');
      setPassword('password123');
    }
    setErrors({});
  }

  return (
    <div className="login-root">
      {/* Left panel — form */}
      <div className="login-panel">
        {/* Logo */}
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

        <h1 className="login-heading">Welcome back</h1>
        <p className="login-subheading">Sign in to manage your applicants and documents.</p>

        {/* Error banner */}
        {Object.keys(errors).length > 0 && (
          <div className="login-error" role="alert" aria-live="polite">
            {Object.values(errors)[0]}
          </div>
        )}

        {/* Login form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-fields">
            <div>
              <label htmlFor="email" className="field-label">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@consultancy.com"
                autoComplete="email"
                className="field-input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(({ email: _e, ...rest }) => rest);
                }}
              />
            </div>

            <div>
              <div className="field-label-row">
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <Link href="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="field-input pr-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(({ password: _p, ...rest }) => rest);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="btn-login"
            aria-busy={loading}
          >
            {loading ? 'Signing in…' : 'Sign in to EduFlow'}
          </button>
        </form>

        {/* Demo access */}
        <div className="demo-access">
          <p className="demo-access__label">Quick Demo Access</p>
          <div className="demo-access__buttons">
            <button type="button" className="btn-demo" onClick={() => prefill('admin')}>
              🟢 Admin View
            </button>
            <button type="button" className="btn-demo" onClick={() => prefill('applicant')}>
              🎓 Applicant View
            </button>
          </div>
        </div>

        <p className="login-footer">© 2026 EduFlow · Trusted by 50+ education consultancies</p>
      </div>

      {/* Right panel — illustration */}
      <div className="login-illustration" aria-hidden="true">
        <div className="illus-circle-1" />
        <div className="illus-circle-2" />

        <svg className="illus-svg" viewBox="0 0 500 440" width="420" height="370">
          <circle
            cx="250"
            cy="220"
            r="200"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="42"
          />
          <circle
            cx="250"
            cy="220"
            r="130"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="26"
          />
          <circle cx="46" cy="46" r="3" fill="rgba(255,255,255,0.2)" />
          <circle cx="454" cy="56" r="3" fill="rgba(255,255,255,0.2)" />
          <circle cx="30" cy="394" r="3" fill="rgba(255,255,255,0.2)" />
          <circle cx="462" cy="390" r="4" fill="rgba(255,255,255,0.2)" />

          {/* Stat cards */}
          <rect x="16" y="76" width="110" height="60" rx="12" fill="white" fillOpacity="0.95" />
          <text
            x="71"
            y="102"
            textAnchor="middle"
            fill="#0F172A"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="22"
            fontWeight="800"
          >
            247
          </text>
          <text
            x="71"
            y="122"
            textAnchor="middle"
            fill="#64748B"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="10.5"
            fontWeight="500"
          >
            Active Students
          </text>

          <rect x="374" y="76" width="110" height="60" rx="12" fill="white" fillOpacity="0.95" />
          <text
            x="429"
            y="102"
            textAnchor="middle"
            fill="#16A34A"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="22"
            fontWeight="800"
          >
            98%
          </text>
          <text
            x="429"
            y="122"
            textAnchor="middle"
            fill="#64748B"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="10.5"
            fontWeight="500"
          >
            Visa Success
          </text>

          {/* Main card */}
          <rect x="88" y="140" width="274" height="196" rx="16" fill="white" fillOpacity="0.97" />
          <circle cx="118" cy="172" r="16" fill="#DBEAFE" />
          <text
            x="118"
            y="177"
            textAnchor="middle"
            fill="#1D4ED8"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="11"
            fontWeight="700"
          >
            SC
          </text>
          <rect x="142" y="160" width="124" height="9" rx="4" fill="#0F172A" fillOpacity="0.13" />
          <rect x="142" y="175" width="88" height="7" rx="3" fill="#0F172A" fillOpacity="0.07" />
          <line x1="102" y1="198" x2="348" y2="198" stroke="#F1F5F9" strokeWidth="1.5" />
          <rect x="102" y="212" width="216" height="7" rx="3" fill="#0F172A" fillOpacity="0.06" />
          <rect x="102" y="226" width="180" height="7" rx="3" fill="#0F172A" fillOpacity="0.06" />
          <rect x="102" y="240" width="196" height="7" rx="3" fill="#0F172A" fillOpacity="0.06" />
          <rect x="102" y="260" width="228" height="6" rx="3" fill="#E2E8F0" />
          <rect x="102" y="260" width="171" height="6" rx="3" fill="#16A34A" />
          <text
            x="102"
            y="280"
            fill="rgba(255,255,255,0.5)"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="9.5"
          >
            75% complete
          </text>
          <rect x="102" y="292" width="90" height="24" rx="12" fill="#DCFCE7" />
          <text
            x="147"
            y="308"
            textAnchor="middle"
            fill="#16A34A"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="11"
            fontWeight="600"
          >
            ✓ Approved
          </text>
          <rect x="200" y="292" width="64" height="24" rx="7" fill="#2563EB" />
          <text
            x="232"
            y="308"
            textAnchor="middle"
            fill="white"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="11"
            fontWeight="600"
          >
            View
          </text>
          <rect x="272" y="292" width="60" height="24" rx="7" fill="#F1F5F9" />
          <text
            x="302"
            y="308"
            textAnchor="middle"
            fill="#64748B"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="11"
          >
            Save
          </text>

          {/* Alert card */}
          <rect x="20" y="306" width="144" height="76" rx="12" fill="white" fillOpacity="0.93" />
          <circle cx="46" cy="330" r="13" fill="#FEF3C7" />
          <text
            x="46"
            y="336"
            textAnchor="middle"
            fill="#D97706"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="13"
            fontWeight="800"
          >
            !
          </text>
          <rect x="64" y="322" width="80" height="8" rx="4" fill="#0F172A" fillOpacity="0.12" />
          <rect x="64" y="336" width="60" height="6" rx="3" fill="#0F172A" fillOpacity="0.07" />
          <rect x="28" y="354" width="120" height="20" rx="10" fill="#FEF3C7" />
          <text
            x="88"
            y="368"
            textAnchor="middle"
            fill="#D97706"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="10.5"
            fontWeight="600"
          >
            Pending Review
          </text>

          {/* Success badge */}
          <rect x="358" y="238" width="122" height="74" rx="12" fill="white" fillOpacity="0.93" />
          <circle cx="383" cy="263" r="13" fill="#DCFCE7" />
          <text
            x="383"
            y="269"
            textAnchor="middle"
            fill="#16A34A"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="13"
            fontWeight="700"
          >
            ✓
          </text>
          <rect x="402" y="255" width="62" height="8" rx="4" fill="#0F172A" fillOpacity="0.12" />
          <rect x="402" y="269" width="46" height="6" rx="3" fill="#0F172A" fillOpacity="0.07" />
          <rect x="366" y="286" width="100" height="18" rx="9" fill="#DCFCE7" />
          <text
            x="416"
            y="299"
            textAnchor="middle"
            fill="#16A34A"
            fontFamily="Plus Jakarta Sans,system-ui"
            fontSize="10"
            fontWeight="600"
          >
            Document OK
          </text>

          {/* Connectors */}
          <line
            x1="124"
            y1="140"
            x2="88"
            y2="140"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line
            x1="164"
            y1="368"
            x2="144"
            y2="350"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line
            x1="356"
            y1="275"
            x2="362"
            y2="275"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        <div className="illus-caption">
          <p className="illus-caption__heading">One platform for every step</p>
          <p className="illus-caption__body">
            Replace WhatsApp, spreadsheets, and email with one system to collect, verify, and track
            every student document.
          </p>
        </div>
      </div>
    </div>
  );
}
