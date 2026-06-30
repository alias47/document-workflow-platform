const EVENTS = [
  {
    id: '1',
    dotBg: '#DCFCE7',
    dotColor: '#16A34A',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    title: 'Passport approved for Arjun Kumar',
    meta: 'Sarah Mitchell · 2 hours ago',
    body: null,
  },
  {
    id: '2',
    dotBg: '#DBEAFE',
    dotColor: '#2563EB',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
      </svg>
    ),
    title: 'Bank statement uploaded by Li Chen',
    meta: 'System · 5 hours ago',
    body: null,
  },
  {
    id: '3',
    dotBg: '#F1F5F9',
    dotColor: '#64748B',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    title: 'New student added: Mohammed Al-Lami',
    meta: 'Sarah Mitchell · Yesterday',
    body: null,
  },
  {
    id: '4',
    dotBg: '#FFE4E6',
    dotColor: '#DC2626',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    title: 'Transcript rejected for Fatima Nasser',
    meta: 'Sarah Mitchell · Yesterday',
    body: 'Document is blurry and unreadable. Please re-upload a clearer scan.',
  },
  {
    id: '5',
    dotBg: '#DCFCE7',
    dotColor: '#16A34A',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    title: 'Priya Sharma – All documents approved',
    meta: 'Sarah Mitchell · 2 days ago',
    body: null,
  },
] as const;

export function DashboardTimeline() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Recent Activity</div>
      </div>
      <div className="card-body">
        <div className="timeline">
          {EVENTS.map((event) => (
            <div key={event.id} className="timeline-item">
              <div className="timeline-connector">
                <div
                  className="timeline-dot"
                  style={{ background: event.dotBg, color: event.dotColor }}
                >
                  {event.icon}
                </div>
                <div className="timeline-line" />
              </div>
              <div className="timeline-content">
                <div className="timeline-content__title">{event.title}</div>
                <div className="timeline-content__meta">{event.meta}</div>
                {event.body && <div className="timeline-content__body">{event.body}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
