import Link from 'next/link';

import { DashboardDocumentsTable } from '@/features/dashboard/components/DashboardDocumentsTable';
import { DashboardRecentStudents } from '@/features/dashboard/components/DashboardRecentStudents';
import { DashboardStatCards } from '@/features/dashboard/components/DashboardStatCards';
import { DashboardTimeline } from '@/features/dashboard/components/DashboardTimeline';
import { DashboardWorkflow } from '@/features/dashboard/components/DashboardWorkflow';

export default function DashboardPage() {
  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Good morning, Sarah. Here&apos;s what&apos;s happening today.
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
            View Students
          </Link>
          <button type="button" className="btn btn-primary">
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
            Add Student
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <DashboardStatCards />
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
          <DashboardRecentStudents />
          <DashboardDocumentsTable />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <DashboardWorkflow />
          <DashboardTimeline />
        </div>
      </div>
    </div>
  );
}
