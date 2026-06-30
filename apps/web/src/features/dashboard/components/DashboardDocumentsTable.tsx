'use client';

import { useToast } from '@/components/ui/toast';

const DOCS = [
  {
    id: '1',
    icon: '📄',
    iconBg: '#FFF1F2',
    name: 'Passport Copy',
    meta: 'PDF · 2.4 MB',
    avatarColor: 'blue',
    avatarInitials: 'AK',
    student: 'Arjun Kumar',
    submitted: '2 hours ago',
  },
  {
    id: '2',
    icon: '📝',
    iconBg: '#EFF6FF',
    name: 'Bank Statement',
    meta: 'PDF · 1.1 MB',
    avatarColor: 'green',
    avatarInitials: 'LC',
    student: 'Li Chen',
    submitted: '5 hours ago',
  },
  {
    id: '3',
    icon: '🖼️',
    iconBg: '#F0FDF4',
    name: 'Academic Transcript',
    meta: 'JPG · 890 KB',
    avatarColor: 'amber',
    avatarInitials: 'FN',
    student: 'Fatima Nasser',
    submitted: 'Yesterday',
  },
] as const;

export function DashboardDocumentsTable() {
  const { toast } = useToast();

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Documents Awaiting Review</div>
          <div className="card-subtitle">Review and approve submitted documents</div>
        </div>
        <span className="badge badge-warning">34 pending</span>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Student</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {DOCS.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        background: doc.iconBg,
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {doc.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{doc.name}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: '#64748B' }}>
                        {doc.meta}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar avatar-sm" data-color={doc.avatarColor}>
                      {doc.avatarInitials}
                    </div>
                    {doc.student}
                  </div>
                </td>
                <td style={{ color: '#64748B' }}>{doc.submitted}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="btn btn-secondary btn-sm">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Review
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        toast({
                          type: 'success',
                          title: 'Document approved!',
                          message: `${doc.name} has been approved.`,
                        })
                      }
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() =>
                        toast({
                          type: 'error',
                          title: 'Document rejected',
                          message: `${doc.name} has been rejected.`,
                        })
                      }
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer">
        <button type="button" className="btn btn-ghost btn-sm" style={{ margin: '0 auto' }}>
          View all 34 pending documents →
        </button>
      </div>
    </div>
  );
}
