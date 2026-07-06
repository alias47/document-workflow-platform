import type { StaffWorkloadItem } from '../../types/dashboard.types';

interface StaffWorkloadTableProps {
  workload: StaffWorkloadItem[];
}

/**
 * Staff workload table (Sprint 11.5 §13). Rendered only for managers/admins —
 * the page gates this on the `dashboard.workload.view`-protected endpoint.
 * Task-based columns are omitted (no Task module in this platform).
 */
export function StaffWorkloadTable({ workload }: StaffWorkloadTableProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Staff Workload</div>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {workload.length === 0 ? (
          <p
            style={{ fontSize: 'var(--font-size-sm)', color: '#94A3B8', padding: 'var(--space-4)' }}
          >
            No staff to display.
          </p>
        ) : (
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}
          >
            <thead>
              <tr
                style={{ textAlign: 'left', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}
              >
                <th style={{ padding: 'var(--space-3)' }}>Staff</th>
                <th style={{ padding: 'var(--space-3)' }}>Role</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Assigned</th>
                <th style={{ padding: 'var(--space-3)', minWidth: '140px' }}>Workload</th>
              </tr>
            </thead>
            <tbody>
              {workload.map((row) => (
                <tr key={row.staffId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: 'var(--space-3)', color: '#0F172A', fontWeight: 500 }}>
                    {row.name}
                  </td>
                  <td style={{ padding: 'var(--space-3)', color: '#64748B' }}>{row.role}</td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'right', color: '#334155' }}>
                    {row.assignedApplicants}
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div className="progress" style={{ flex: 1 }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${row.workloadPercent}%`,
                            background: row.workloadPercent >= 80 ? '#DC2626' : '#2563EB',
                          }}
                        />
                      </div>
                      <span style={{ color: '#64748B', minWidth: '36px', textAlign: 'right' }}>
                        {row.workloadPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
