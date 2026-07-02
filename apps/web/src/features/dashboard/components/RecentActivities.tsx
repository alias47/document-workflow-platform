import type { RecentActivity } from '../types/dashboard.types';

interface IconStyle {
  bg: string;
  color: string;
  path: React.ReactNode;
}

const ICON_BY_TYPE: Record<string, IconStyle> = {
  'applicant.created': {
    bg: '#EFF6FF',
    color: '#2563EB',
    path: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </>
    ),
  },
  'applicant.updated': {
    bg: '#EFF6FF',
    color: '#2563EB',
    path: (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </>
    ),
  },
  'document.uploaded': {
    bg: '#ECFEFF',
    color: '#0891B2',
    path: (
      <>
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </>
    ),
  },
  'document.deleted': {
    bg: '#FEF2F2',
    color: '#DC2626',
    path: (
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4h6v2" />
      </>
    ),
  },
  'document.verified': {
    bg: '#F0FDF4',
    color: '#16A34A',
    path: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
  },
  'document.rejected': {
    bg: '#FEF2F2',
    color: '#DC2626',
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </>
    ),
  },
  'note.created': {
    bg: '#F5F3FF',
    color: '#7C3AED',
    path: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    ),
  },
  'note.updated': {
    bg: '#F5F3FF',
    color: '#7C3AED',
    path: (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </>
    ),
  },
  'note.deleted': {
    bg: '#FEF2F2',
    color: '#DC2626',
    path: (
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4h6v2" />
      </>
    ),
  },
  'workflow.stage_changed': {
    bg: '#FFFBEB',
    color: '#D97706',
    path: (
      <>
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </>
    ),
  },
};

const DEFAULT_ICON: IconStyle = {
  bg: '#F1F5F9',
  color: '#64748B',
  path: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Recent Activity</div>
      </div>
      <div className="card-body">
        <div className="timeline">
          {activities.map((a) => {
            const style = ICON_BY_TYPE[a.type] ?? DEFAULT_ICON;
            const actorName = a.actor ? `${a.actor.firstName} ${a.actor.lastName}` : 'System';
            return (
              <div key={a.id} className="timeline-item">
                <div className="timeline-connector">
                  <div
                    className="timeline-dot"
                    style={{ background: style.bg, color: style.color }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {style.path}
                    </svg>
                  </div>
                  <div className="timeline-line" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-content__title">{a.title}</div>
                  <div className="timeline-content__meta">
                    {actorName} · {formatDateTime(a.createdAt)}
                  </div>
                  {a.description && <div className="timeline-content__body">{a.description}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
