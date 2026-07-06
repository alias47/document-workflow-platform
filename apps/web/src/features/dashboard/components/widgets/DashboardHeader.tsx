import Link from 'next/link';

interface DashboardHeaderProps {
  firstName: string;
}

/** Dashboard page header with greeting and primary actions (Sprint 11.5 §18). */
export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">
          Welcome back, {firstName}. Here&apos;s your organization at a glance.
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
            aria-hidden="true"
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
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Applicant
        </Link>
      </div>
    </div>
  );
}
