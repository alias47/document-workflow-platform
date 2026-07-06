'use client';

import { NotificationStatusBadge } from './NotificationStatusBadge';

import type { Notification } from '../types';

const TEMPLATE_LABELS: Record<string, string> = {
  staff_welcome: 'Staff Welcome',
  applicant_portal_invitation: 'Portal Invitation',
  applicant_password_reset: 'Applicant Password Reset',
  staff_password_reset: 'Staff Password Reset',
  document_uploaded: 'Document Uploaded',
  document_approved: 'Document Approved',
  document_rejected: 'Document Rejected',
  new_document_requirement_assigned: 'New Requirement',
  applicant_assigned_to_staff: 'Applicant Assigned',
  applicant_workflow_stage_changed: 'Stage Changed',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

interface NotificationTableProps {
  notifications: Notification[];
  onView: (notification: Notification) => void;
  onRetry: (notification: Notification) => void;
}

export function NotificationTable({ notifications, onView, onRetry }: NotificationTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
            <th style={thStyle}>Recipient</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Retries</th>
            <th style={thStyle}>Created</th>
            <th style={{ ...thStyle, width: '120px' }} />
          </tr>
        </thead>
        <tbody>
          {notifications.map((n) => {
            const canRetry = n.status === 'failed' && n.retryCount < n.maxRetries;
            return (
              <tr key={n.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 500, color: '#0F172A' }}>{n.recipient}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    {n.subject}
                  </div>
                </td>
                <td style={{ padding: '12px', color: '#374151' }}>
                  {TEMPLATE_LABELS[n.template] ?? n.template}
                </td>
                <td style={{ padding: '12px' }}>
                  <NotificationStatusBadge status={n.status} />
                </td>
                <td style={{ padding: '12px', color: '#374151' }}>
                  {n.retryCount} / {n.maxRetries}
                </td>
                <td style={{ padding: '12px', color: '#64748B', fontSize: '13px' }}>
                  {formatDate(n.createdAt)}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onView(n)}
                      aria-label={`View notification to ${n.recipient}`}
                    >
                      View
                    </button>
                    {canRetry && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onRetry(n)}
                        aria-label={`Retry notification to ${n.recipient}`}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
