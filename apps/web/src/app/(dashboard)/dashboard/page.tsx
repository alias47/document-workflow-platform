'use client';

import Link from 'next/link';

import { ApplicantStatusChart } from '@/features/dashboard/components/ApplicantStatusChart';
import { DashboardEmpty } from '@/features/dashboard/components/DashboardEmpty';
import { DashboardError } from '@/features/dashboard/components/DashboardError';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { DashboardSummaryCards } from '@/features/dashboard/components/DashboardSummaryCards';
import { DocumentStatusChart } from '@/features/dashboard/components/DocumentStatusChart';
import { RecentActivities } from '@/features/dashboard/components/RecentActivities';
import { RecentApplicants } from '@/features/dashboard/components/RecentApplicants';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useDashboard();

  const firstName = user?.firstName ?? 'there';

  const isEmpty =
    data !== undefined && data.summary.totalApplicants === 0 && data.summary.totalDocuments === 0;

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Good morning, {firstName}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/applicants" className="btn btn-secondary">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            View Applicants
          </Link>
          <Link href="/applicants/new" className="btn btn-primary">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Applicant
          </Link>
        </div>
      </div>

      {isLoading && <DashboardSkeleton />}

      {isError && <DashboardError onRetry={() => void refetch()} />}

      {!isLoading && !isError && isEmpty && <DashboardEmpty />}

      {!isLoading && !isError && !isEmpty && data && (
        <>
          {/* Stat cards — 7 items */}
          <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
            <DashboardSummaryCards summary={data.summary} />
          </div>

          {/* Main content grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: 'var(--space-5)',
              alignItems: 'start',
            }}
          >
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <RecentApplicants applicants={data.recentApplicants} />
              <RecentActivities activities={data.recentActivities} />
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <ApplicantStatusChart applicantSummary={data.applicantSummary} />
              <DocumentStatusChart documentSummary={data.documentSummary} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
