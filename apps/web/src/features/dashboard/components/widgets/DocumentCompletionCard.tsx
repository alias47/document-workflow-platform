import type { DocumentCompletion } from '../../types/dashboard.types';

interface DocumentCompletionCardProps {
  completion: DocumentCompletion;
}

/** Document completion overview (Sprint 11.5 §9). */
export function DocumentCompletionCard({ completion }: DocumentCompletionCardProps) {
  const stats: { label: string; value: number; color: string }[] = [
    { label: 'Fully Complete', value: completion.fullyComplete, color: '#16A34A' },
    { label: 'Incomplete', value: completion.incomplete, color: '#D97706' },
    { label: 'Awaiting Upload', value: completion.awaitingUpload, color: '#2563EB' },
    { label: 'Missing Documents', value: completion.missingDocuments, color: '#DC2626' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Document Completion</div>
      </div>
      <div
        className="card-body"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {/* Average completion gauge */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-2)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: '#334155',
              }}
            >
              Average Completion
            </span>
            <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: '#0F172A' }}>
              {completion.averageCompletion}%
            </span>
          </div>
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${completion.averageCompletion}%`, background: '#16A34A' }}
            />
          </div>
        </div>

        {/* Breakdown grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-3)',
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: '#F8FAFC',
              }}
            >
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: '#64748B' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
