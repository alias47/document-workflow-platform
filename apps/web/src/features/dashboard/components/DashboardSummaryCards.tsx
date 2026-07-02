import type { DashboardSummary } from '../types/dashboard.types';

interface StatItem {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
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
  );
}

function UserCheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  const items: StatItem[] = [
    {
      label: 'Total Applicants',
      value: summary.totalApplicants,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      icon: <UsersIcon />,
    },
    {
      label: 'Active Applicants',
      value: summary.activeApplicants,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      icon: <UserCheckIcon />,
    },
    {
      label: 'Archived Applicants',
      value: summary.archivedApplicants,
      iconBg: '#F1F5F9',
      iconColor: '#64748B',
      icon: <ArchiveIcon />,
    },
    {
      label: 'Total Documents',
      value: summary.totalDocuments,
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
      icon: <FileTextIcon />,
    },
    {
      label: 'Pending Documents',
      value: summary.pendingDocuments,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      icon: <ClockIcon />,
    },
    {
      label: 'Verified Documents',
      value: summary.verifiedDocuments,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      icon: <CheckCircleIcon />,
    },
    {
      label: 'Rejected Documents',
      value: summary.rejectedDocuments,
      iconBg: '#FFE4E6',
      iconColor: '#DC2626',
      icon: <XCircleIcon />,
    },
  ];

  return (
    <>
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <div
            className="stat-card__icon"
            style={{ background: item.iconBg, color: item.iconColor }}
          >
            {item.icon}
          </div>
          <div>
            <div className="stat-card__label">{item.label}</div>
            <div className="stat-card__value">{item.value}</div>
          </div>
        </div>
      ))}
    </>
  );
}
