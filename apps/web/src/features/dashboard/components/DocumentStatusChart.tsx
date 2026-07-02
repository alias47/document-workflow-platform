import type { DocumentSummary } from '../types/dashboard.types';

interface DocumentStatusChartProps {
  documentSummary: DocumentSummary;
}

interface BarItem {
  label: string;
  count: number;
  barColor: string;
  badgeClass: string;
}

export function DocumentStatusChart({ documentSummary }: DocumentStatusChartProps) {
  const total =
    documentSummary.pending +
    documentSummary.verified +
    documentSummary.rejected +
    documentSummary.expired;

  const items: BarItem[] = [
    {
      label: 'Pending',
      count: documentSummary.pending,
      barColor: '#F59E0B',
      badgeClass: 'badge-warning',
    },
    {
      label: 'Verified',
      count: documentSummary.verified,
      barColor: '#16A34A',
      badgeClass: 'badge-success',
    },
    {
      label: 'Rejected',
      count: documentSummary.rejected,
      barColor: '#DC2626',
      badgeClass: 'badge-danger',
    },
    {
      label: 'Expired',
      count: documentSummary.expired,
      barColor: '#94A3B8',
      badgeClass: 'badge-neutral',
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Document Overview</div>
        <span style={{ fontSize: 'var(--font-size-sm)', color: '#64748B' }}>{total} total</span>
      </div>
      <div
        className="card-body"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: '#334155',
                  }}
                >
                  {item.label}
                </div>
                <span className={`badge ${item.badgeClass}`}>{item.count}</span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${pct}%`, background: item.barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
