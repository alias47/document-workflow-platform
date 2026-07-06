'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { invitationService } from '@/services/invitation.service';

type PageState =
  'loading' | 'invalid' | 'expired' | 'revoked' | 'already_activated' | 'form' | 'success';

interface FormValues {
  password: string;
  confirmPassword: string;
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function ActivatePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [pageState, setPageState] = useState<PageState>('loading');
  const [applicantName, setApplicantName] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();
  const password = watch('password');

  useEffect(() => {
    if (!token) {
      setPageState('invalid');
      return;
    }

    invitationService
      .validateToken(token)
      .then((res) => {
        const result = res.data;
        if (result.valid) {
          setApplicantName(result.applicantName);
          setOrgName(result.organizationName);
          setPageState('form');
        } else {
          const reason = result.reason;
          if (reason === 'expired') setPageState('expired');
          else if (reason === 'revoked') setPageState('revoked');
          else if (reason === 'already_activated') setPageState('already_activated');
          else setPageState('invalid');
        }
      })
      .catch(() => setPageState('invalid'));
  }, [token]);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await invitationService.activateAccount(token, values.password);
      setPageState('success');
      setTimeout(() => router.push('/applicant/login'), 3000);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Activation failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          {pageState === 'loading' && <LoadingState />}
          {pageState === 'invalid' && <InvalidState />}
          {pageState === 'expired' && <ExpiredState />}
          {pageState === 'revoked' && <RevokedState />}
          {pageState === 'already_activated' && <AlreadyActivatedState />}
          {pageState === 'success' && <SuccessState applicantName={applicantName} />}
          {pageState === 'form' && (
            <FormState
              applicantName={applicantName}
              orgName={orgName}
              register={register}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              errors={errors}
              password={password}
              submitError={submitError}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-6">
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid #E2E8F0',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          margin: '0 auto 12px',
        }}
      />
      <p style={{ fontSize: '14px', color: '#64748B' }}>Validating your invitation…</p>
    </div>
  );
}

function InvalidState() {
  return (
    <div className="text-center py-6">
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#FFE4E6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#DC2626',
          fontSize: '22px',
        }}
      >
        ✕
      </div>
      <h1 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Invalid Link</h1>
      <p style={{ fontSize: '14px', color: '#64748B' }}>
        This activation link is invalid. Please contact your consultant for a new invitation.
      </p>
    </div>
  );
}

function ExpiredState() {
  return (
    <div className="text-center py-6">
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#FEF9C3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#CA8A04',
          fontSize: '22px',
        }}
      >
        ⏰
      </div>
      <h1 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Link Expired</h1>
      <p style={{ fontSize: '14px', color: '#64748B' }}>
        This invitation link has expired. Please contact your consultant to receive a new one.
      </p>
    </div>
  );
}

function RevokedState() {
  return (
    <div className="text-center py-6">
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#FFE4E6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#DC2626',
          fontSize: '22px',
        }}
      >
        🚫
      </div>
      <h1 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Invitation Revoked</h1>
      <p style={{ fontSize: '14px', color: '#64748B' }}>
        This invitation has been revoked. Please contact your consultant for assistance.
      </p>
    </div>
  );
}

function AlreadyActivatedState() {
  return (
    <div className="text-center py-6">
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#DCFCE7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#16A34A',
          fontSize: '22px',
        }}
      >
        ✓
      </div>
      <h1 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
        Account Already Activated
      </h1>
      <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>
        Your portal account has already been activated.
      </p>
      <a href="/applicant/login" className="btn btn-primary btn-sm">
        Sign in
      </a>
    </div>
  );
}

function SuccessState({ applicantName }: { applicantName: string | null }) {
  return (
    <div className="text-center py-6">
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#DCFCE7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#16A34A',
          fontSize: '22px',
        }}
      >
        ✓
      </div>
      <h1 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Account Activated!</h1>
      <p style={{ fontSize: '14px', color: '#64748B' }}>
        {applicantName ? `Welcome, ${applicantName}! ` : ''}
        Your portal account is ready. Redirecting you to the sign-in page…
      </p>
    </div>
  );
}

interface FormStateProps {
  applicantName: string | null;
  orgName: string | null;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  handleSubmit: ReturnType<typeof useForm<FormValues>>['handleSubmit'];
  onSubmit: (values: FormValues) => Promise<void>;
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
  password: string;
  submitError: string | null;
  isSubmitting: boolean;
}

function FormState({
  applicantName,
  orgName,
  register,
  handleSubmit,
  onSubmit,
  errors,
  password,
  submitError,
  isSubmitting,
}: FormStateProps) {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Activate Your Account</h1>
        {orgName && (
          <p className="mt-1 text-sm text-gray-500">
            {applicantName ? `Welcome, ${applicantName}!` : 'Welcome!'} Set a password to access the{' '}
            {orgName} portal.
          </p>
        )}
      </div>

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 500 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="input"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              validate: (v) =>
                PASSWORD_REGEX.test(v) ||
                'Must include uppercase, lowercase, number, and special character',
            })}
          />
          {errors.password && (
            <p role="alert" style={{ fontSize: '12px', color: '#DC2626' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" style={{ fontSize: '14px', fontWeight: 500 }}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="input"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p role="alert" style={{ fontSize: '12px', color: '#DC2626' }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <p style={{ fontSize: '12px', color: '#94A3B8' }}>
          Must be at least 8 characters with uppercase, lowercase, number, and special character.
        </p>

        {submitError && (
          <p role="alert" style={{ fontSize: '13px', color: '#DC2626' }}>
            {submitError}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Activating…' : 'Activate Account'}
        </button>
      </form>
    </>
  );
}
