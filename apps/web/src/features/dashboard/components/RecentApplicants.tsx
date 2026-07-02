import Link from 'next/link';

import type { RecentApplicant } from '../types/dashboard.types';

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-success',
  archived: 'badge-neutral',
  pending: 'badge-warning',
  rejected: 'badge-danger',
};

function badgeClass(status: string): string {
  return STATUS_BADGE[status] ?? 'badge-neutral';
}

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const AVATAR_COLORS = ['blue', 'violet', 'teal', 'amber', 'green'] as const;

interface RecentApplicantsProps {
  applicants: RecentApplicant[];
}

export function RecentApplicants({ applicants }: RecentApplicantsProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Recent Applicants</div>
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
              <th>Applicant</th>
              <th>Status</th>
              <th>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((a, i) => {
              const badge = badgeClass(a.status);
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <tr key={a.id} className="table-row-link">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar avatar-sm" data-color={color}>
                        {initials(a.firstName, a.lastName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>
                          {a.firstName} {a.lastName}
                        </div>
                        {a.email && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: '#64748B' }}>
                            {a.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${badge}`}>
                      <span className={`badge-dot ${badge}`} />
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ color: '#64748B' }}>{formatDate(a.createdAt)}</td>
                  <td>
                    <Link href={`/applicants/${a.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
