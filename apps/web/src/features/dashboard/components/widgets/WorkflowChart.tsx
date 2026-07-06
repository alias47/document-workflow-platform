import type { StageCount } from '../../types/dashboard.types';

interface WorkflowChartProps {
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

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Slice {
  stageId: string;
  stageName: string;
  color: string;
  count: number;
  fraction: number;
}

/**
 * Workflow distribution rendered as a pie (SVG donut) plus a bar breakdown.
 * Uses only inline SVG + CSS — no external chart library (TASK.md §19). Stage
 * names/colors come from the workflow configuration.
 */
export function WorkflowChart({ stages }: WorkflowChartProps) {
  const total = stages.reduce((sum, s) => sum + s.applicantCount, 0);

  const slices: Slice[] = stages.map((s, i) => ({
    stageId: s.stageId,
    stageName: s.stageName,
    color: s.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length] ?? '#64748B',
    count: s.applicantCount,
    fraction: total > 0 ? s.applicantCount / total : 0,
  }));

  // Precompute stroke-dashoffset for each donut segment.
  let cumulative = 0;
  const segments = slices.map((slice) => {
    const dash = slice.fraction * CIRCUMFERENCE;
    const gap = CIRCUMFERENCE - dash;
    const offset = -cumulative * CIRCUMFERENCE;
    cumulative += slice.fraction;
    return { ...slice, dash, gap, offset };
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Workflow Distribution</div>
        <span style={{ fontSize: 'var(--font-size-sm)', color: '#64748B' }}>{total} total</span>
      </div>
      <div className="card-body">
        {total === 0 ? (
          <p style={{ fontSize: 'var(--font-size-sm)', color: '#94A3B8' }}>
            No applicants in any workflow stage yet.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-6)',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* Pie (donut) */}
            <svg
              width="170"
              height="170"
              viewBox="0 0 170 170"
              role="img"
              aria-label="Workflow distribution pie chart"
              style={{ flexShrink: 0 }}
            >
              <g transform="translate(85,85) rotate(-90)">
                {segments.map((seg) => (
                  <circle
                    key={seg.stageId}
                    r={RADIUS}
                    cx="0"
                    cy="0"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="24"
                    strokeDasharray={`${seg.dash} ${seg.gap}`}
                    strokeDashoffset={seg.offset}
                  />
                ))}
              </g>
            </svg>

            {/* Bar breakdown + legend */}
            <div
              style={{
                flex: 1,
                minWidth: '180px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              {slices.map((slice) => (
                <div key={slice.stageId}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: 'var(--font-size-sm)',
                        color: '#334155',
                      }}
                    >
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '2px',
                          background: slice.color,
                          display: 'inline-block',
                        }}
                        aria-hidden="true"
                      />
                      {slice.stageName}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: '#64748B' }}>
                      {slice.count} ({Math.round(slice.fraction * 100)}%)
                    </span>
                  </div>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${Math.round(slice.fraction * 100)}%`,
                        background: slice.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
