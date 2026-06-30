import Link from 'next/link';

const STUDENTS = [
  {
    id: '1',
    initials: 'AK',
    color: 'blue',
    name: 'Arjun Kumar',
    email: 'arjun@email.com',
    destination: '🇬🇧 UK',
    badgeClass: 'badge-warning',
    status: 'Under Review',
    docsWidth: '60%',
    docs: '3/5',
    added: '2 Jun 2026',
  },
  {
    id: '2',
    initials: 'PS',
    color: 'violet',
    name: 'Priya Sharma',
    email: 'priya@email.com',
    destination: '🇨🇦 Canada',
    badgeClass: 'badge-success',
    status: 'Completed',
    docsWidth: '100%',
    docsBarClass: 'progress-bar--success',
    docs: '5/5',
    added: '31 May 2026',
  },
  {
    id: '3',
    initials: 'ML',
    color: 'teal',
    name: 'Mohammed Al-Lami',
    email: 'mlami@email.com',
    destination: '🇦🇺 Australia',
    badgeClass: 'badge-neutral',
    status: 'New',
    docsWidth: '0%',
    docs: '0/6',
    added: '29 May 2026',
  },
  {
    id: '4',
    initials: 'FN',
    color: 'amber',
    name: 'Fatima Nasser',
    email: 'fnasser@email.com',
    destination: '🇩🇪 Germany',
    badgeClass: 'badge-danger',
    status: 'Rejected',
    docsWidth: '40%',
    docsBarClass: 'progress-bar--danger',
    docs: '2/5',
    added: '28 May 2026',
  },
  {
    id: '5',
    initials: 'LC',
    color: 'green',
    name: 'Li Chen',
    email: 'lchen@email.com',
    destination: '🇺🇸 USA',
    badgeClass: 'badge-brand',
    status: 'Pending Docs',
    docsWidth: '70%',
    docsBarClass: 'progress-bar--warning',
    docs: '4/6',
    added: '27 May 2026',
  },
] as const;

export function DashboardRecentStudents() {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Recent Students</div>
          <div className="card-subtitle">Latest applicants added to the system</div>
        </div>
        <Link href="/applicants" className="btn btn-ghost btn-sm">
          View all →
        </Link>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Destination</th>
              <th>Stage</th>
              <th>Documents</th>
              <th>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((s) => (
              <tr key={s.id} className="table-row-link">
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className={`avatar avatar-sm`} data-color={s.color}>
                      {s.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{s.name}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: '#64748B' }}>
                        {s.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{s.destination}</td>
                <td>
                  <span className={`badge ${s.badgeClass}`}>
                    <span className={`badge-dot ${s.badgeClass}`} />
                    {s.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="progress" style={{ width: '80px' }}>
                      <div
                        className={`progress-bar ${'docsBarClass' in s ? s.docsBarClass : ''}`}
                        style={{ width: s.docsWidth }}
                      />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: '#64748B' }}>
                      {s.docs}
                    </span>
                  </div>
                </td>
                <td style={{ color: '#64748B' }}>{s.added}</td>
                <td>
                  <Link href={`/applicants/${s.id}`} className="btn btn-ghost btn-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
