import type { DashboardKpis } from '../../types/dashboard.types';

interface KPICardsProps {
  kpis: DashboardKpis;
}

interface KpiItem {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
}

/**
 * KPI cards for the analytics dashboard (Sprint 11.5 §7). Task-based KPIs are
 * intentionally absent — this platform has no Task module.
 */
export function KPICards({ kpis }: KPICardsProps) {
  const items: KpiItem[] = [
    {
      label: 'Total Applicants',
      value: kpis.totalApplicants,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      label: 'Active Applicants',
      value: kpis.activeApplicants,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
    },
    {
      label: 'Completed Applicants',
      value: kpis.completedApplicants,
      iconBg: '#F1F5F9',
      iconColor: '#64748B',
    },
    {
      label: 'Pending Documents',
      value: kpis.pendingDocuments,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      label: 'Completed Documents',
      value: kpis.completedDocuments,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
    },
    {
      label: 'Active Workflows',
      value: kpis.activeWorkflows,
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
    },
    {
      label: 'Completed Workflows',
      value: kpis.completedWorkflows,
      iconBg: '#ECFEFF',
      iconColor: '#0891B2',
    },
    { label: 'Total Staff', value: kpis.totalStaff, iconBg: '#EFF6FF', iconColor: '#2563EB' },
  ];

  return (
    <>
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <div
            className="stat-card__icon"
            style={{ background: item.iconBg, color: item.iconColor }}
            aria-hidden="true"
          >
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
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
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
