const STAGES = [
  {
    label: 'New Applicants',
    badgeClass: 'badge-neutral',
    count: '42',
    barColor: '#94A3B8',
    width: '17%',
  },
  {
    label: 'Documents Pending',
    badgeClass: 'badge-brand',
    count: '78',
    barColor: '#2563EB',
    width: '32%',
  },
  {
    label: 'Under Review',
    badgeClass: 'badge-warning',
    count: '34',
    barColor: '#F59E0B',
    width: '14%',
  },
  {
    label: 'Completed',
    badgeClass: 'badge-success',
    count: '93',
    barColor: '#16A34A',
    width: '38%',
  },
] as const;

export function DashboardWorkflow() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Workflow Overview</div>
      </div>
      <div
        className="card-body"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {STAGES.map((stage) => (
          <div key={stage.label}>
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
                {stage.label}
              </div>
              <span className={`badge ${stage.badgeClass}`}>{stage.count}</span>
            </div>
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: stage.width, background: stage.barColor }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
