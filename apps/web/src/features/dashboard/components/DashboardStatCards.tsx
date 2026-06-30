export function DashboardStatCards() {
  return (
    <>
      <div className="stat-card">
        <div className="stat-card__icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <div className="stat-card__label">Total Students</div>
          <div className="stat-card__value">247</div>
        </div>
        <div className="stat-card__change stat-card__change--up">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
          +12 this month
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <div className="stat-card__label">Pending Review</div>
          <div className="stat-card__value">34</div>
        </div>
        <div className="stat-card__change stat-card__change--up">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
          +5 since yesterday
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
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
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <div className="stat-card__label">Approved This Month</div>
          <div className="stat-card__value">89</div>
        </div>
        <div className="stat-card__change stat-card__change--up">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
          98% approval rate
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card__icon" style={{ background: '#FFE4E6', color: '#DC2626' }}>
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
          </svg>
        </div>
        <div>
          <div className="stat-card__label">Missing Documents</div>
          <div className="stat-card__value">18</div>
        </div>
        <div className="stat-card__change stat-card__change--down">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          Needs attention
        </div>
      </div>
    </>
  );
}
