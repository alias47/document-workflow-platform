import type { DashboardActivity } from '../../types/dashboard.types';

interface ActivityFeedProps {
  activities: DashboardActivity[];
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const diffMins = Math.round(diffMs / 60_000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Recent activity feed (Sprint 11.5 §11). Latest 20, newest first. */
export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Recent Activity</div>
      </div>
      <div className="card-body">
        {activities.length === 0 ? (
          <p style={{ fontSize: 'var(--font-size-sm)', color: '#94A3B8' }}>No recent activity.</p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            {activities.map((activity) => (
              <li key={activity.id} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {activity.actor
                    ? initials(activity.actor.firstName, activity.actor.lastName)
                    : '•'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 'var(--font-size-sm)', color: '#0F172A', fontWeight: 500 }}
                  >
                    {activity.title}
                  </div>
                  {activity.description && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: '#64748B' }}>
                      {activity.description}
                    </div>
                  )}
                  <div
                    style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8', marginTop: '2px' }}
                  >
                    {activity.target
                      ? `${activity.target.firstName} ${activity.target.lastName} · `
                      : ''}
                    {formatRelativeTime(activity.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
