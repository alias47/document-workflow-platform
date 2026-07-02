import Link from 'next/link';

export function DashboardEmpty() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '16px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563EB',
        }}
      >
        <svg
          width="26"
          height="26"
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
        <p style={{ fontWeight: 700, fontSize: '16px', color: '#0F172A', marginBottom: '4px' }}>
          No data yet
        </p>
        <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '320px' }}>
          Your dashboard will populate once applicants and documents are added to the system.
        </p>
      </div>
      <Link href="/applicants/new" className="btn btn-primary">
        Add first applicant
      </Link>
    </div>
  );
}
