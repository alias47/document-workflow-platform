'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useApplicant, useArchiveApplicant } from '../hooks/use-applicants';

import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

type Tab = 'info' | 'documents' | 'timeline';

const TABS: { id: Tab; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'documents', label: 'Documents' },
  { id: 'timeline', label: 'Timeline' },
];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

interface Props {
  id: string;
}

export function ApplicantProfileContent({ id }: Props) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const { data, isLoading, isError, error } = useApplicant(id);
  const archiveMutation = useArchiveApplicant();

  if (isLoading) {
    return <ApplicantProfileSkeleton />;
  }

  if (isError) {
    const status = (error as { status?: number })?.status;
    return (
      <div className="page">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FFE4E6] flex items-center justify-center text-[#DC2626]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-[#0F172A]">
              {status === 404 ? 'Applicant not found' : 'Failed to load applicant'}
            </p>
            <p className="text-sm text-[#64748B] mt-1">
              {status === 404
                ? 'This applicant may have been archived or does not exist.'
                : ((error as Error)?.message ?? 'An unexpected error occurred.')}
            </p>
          </div>
          <Link href="/applicants" className="btn btn-primary">
            Back to Applicants
          </Link>
        </div>
      </div>
    );
  }

  const applicant = data?.data;
  if (!applicant) return null;

  const applicantId = applicant.id;
  const fullName = `${applicant.firstName} ${applicant.lastName}`;
  const initials = getInitials(applicant.firstName, applicant.lastName);

  function handleArchive() {
    archiveMutation.mutate(applicantId, {
      onSuccess: () => {
        toast({ type: 'success', title: 'Archived', message: `${fullName} has been archived.` });
      },
      onError: () => {
        toast({ type: 'error', title: 'Error', message: 'Failed to archive applicant.' });
      },
    });
  }

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: 'var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          color: '#64748B',
        }}
      >
        <Link href="/applicants" style={{ color: '#64748B', textDecoration: 'none' }}>
          Applicants
        </Link>
        <span>/</span>
        <span style={{ color: '#0F172A', fontWeight: 500 }}>{fullName}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-6 mb-5">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div
            className="avatar avatar-lg"
            style={{ width: '64px', height: '64px', fontSize: '22px', flexShrink: 0 }}
          >
            {initials}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '4px',
              }}
            >
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {fullName}
              </h1>
              <span
                className={cn(
                  'badge',
                  applicant.status === 'active'
                    ? 'badge-success'
                    : applicant.status === 'inactive'
                      ? 'badge-warning'
                      : 'badge-neutral',
                )}
              >
                <span
                  className={cn(
                    'badge-dot',
                    applicant.status === 'active'
                      ? 'badge-success'
                      : applicant.status === 'inactive'
                        ? 'badge-warning'
                        : 'badge-neutral',
                  )}
                />
                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
              </span>
            </div>

            <p
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#64748B',
                background: '#F1F5F9',
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              {applicant.applicantNumber}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                fontSize: '14px',
                color: '#475569',
              }}
            >
              {applicant.email && <span>✉ {applicant.email}</span>}
              {applicant.phone && <span>📞 {applicant.phone}</span>}
              {(applicant.city ?? applicant.country) && (
                <span>📍 {[applicant.city, applicant.country].filter(Boolean).join(', ')}</span>
              )}
            </div>

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                fontSize: '14px',
              }}
            >
              {applicant.nationality && (
                <span style={{ color: '#64748B' }}>
                  Nationality:{' '}
                  <span style={{ fontWeight: 500, color: '#1E293B' }}>{applicant.nationality}</span>
                </span>
              )}
              {applicant.dateOfBirth && (
                <span style={{ color: '#64748B' }}>
                  DOB:{' '}
                  <span style={{ fontWeight: 500, color: '#1E293B' }}>
                    {new Date(applicant.dateOfBirth).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              )}
              <span style={{ color: '#64748B' }}>
                Added:{' '}
                <span style={{ fontWeight: 500, color: '#1E293B' }}>
                  {new Date(applicant.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                toast({ type: 'info', title: 'Coming soon', message: 'Edit applicant form.' })
              }
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: '#DC2626' }}
              onClick={handleArchive}
              disabled={archiveMutation.isPending || applicant.status === 'archived'}
            >
              Archive
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #E2E8F0',
          marginBottom: 'var(--space-5)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'info' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Personal Information
            </h3>
          </div>
          <div className="card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
              }}
            >
              {(
                [
                  ['First Name', applicant.firstName],
                  ['Middle Name', applicant.middleName],
                  ['Last Name', applicant.lastName],
                  ['Email', applicant.email],
                  ['Phone', applicant.phone],
                  ['Gender', applicant.gender],
                  [
                    'Date of Birth',
                    applicant.dateOfBirth
                      ? new Date(applicant.dateOfBirth).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : undefined,
                  ],
                  ['Nationality', applicant.nationality],
                  ['Address', applicant.address],
                  ['City', applicant.city],
                  ['Country', applicant.country],
                ] as [string, string | undefined][]
              ).map(([label, value]) =>
                value ? (
                  <div key={label}>
                    <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '2px' }}>
                      {label}
                    </p>
                    <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>{value}</p>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'documents' || activeTab === 'timeline') && (
        <div className="card">
          <div
            className="card-body"
            style={{
              padding: 'var(--space-12) var(--space-6)',
              textAlign: 'center',
              color: '#94A3B8',
            }}
          >
            <p style={{ fontSize: '14px', marginBottom: '4px', color: '#64748B', fontWeight: 500 }}>
              {activeTab === 'documents' ? 'Documents' : 'Timeline'} coming soon
            </p>
            <p style={{ fontSize: '13px' }}>
              This section will be available once the {activeTab} module is integrated.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicantProfileSkeleton() {
  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: 'var(--space-4)',
          alignItems: 'center',
        }}
      >
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-6 mb-5">
        <div style={{ display: 'flex', gap: '20px' }}>
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
          <div style={{ flex: 1 }}>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-28 mb-4" />
            <div style={{ display: 'flex', gap: '16px' }}>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #E2E8F0',
          marginBottom: 'var(--space-5)',
        }}
      >
        {['Info', 'Documents', 'Timeline'].map((t) => (
          <Skeleton key={t} className="h-9 w-20 mx-2" />
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
