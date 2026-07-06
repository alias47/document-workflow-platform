import type { StageCount } from '../../types/dashboard.types';

interface ApplicantStatusChartProps {
  stages: StageCount[];
}

const FALLBACK_COLORS = [
  '#2563EB',
  '#16A34A',
  '#D97706',
  '#7C3AED',
  '#0891B2',
  '#DC2626',
  '#64748B',
];

/**
 * Applicants grouped by current workflow stage, rendered as horizontal bars.
 * Stage names and colors come from the workflow configuration (never hardcoded).
 */
export function ApplicantStatusChart({ stages }: ApplicantStatusChartProps) {
  const total = stages.reduce((sum, s) => sum + s.applicantCount, 0);
  const maxCount = stages.reduce((max, s) => Math.max(max, s.applicantCount), 0);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Applicant Status</div>
        <span style={{ fontSize: 'var(--font-size-sm)', color: '#64748B' }}>{total} total</span>
      </div>
      <div
        className="card-body"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {stages.length === 0 ? (
          <p style={{ fontSize: 'var(--font-size-sm)', color: '#94A3B8' }}>
            No workflow stages configured yet.
          </p>
        ) : (
          stages.map((stage, i) => {
            const pct = maxCount > 0 ? Math.round((stage.applicantCount / maxCount) * 100) : 0;
            const color = stage.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
            return (
              <div key={stage.stageId}>
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
                    {stage.stageName}
                  </div>
                  <span className="badge badge-neutral">{stage.applicantCount}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
