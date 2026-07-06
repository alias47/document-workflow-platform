'use client';

import { NotificationStatusBadge } from './NotificationStatusBadge';

import type { Notification } from '../types';

interface NotificationDetailsDialogProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}
    >
      <div
        style={{
          width: '120px',
          flexShrink: 0,
          fontSize: '13px',
          fontWeight: 600,
          color: '#64748B',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '13px', color: '#0F172A', wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

export function NotificationDetailsDialog({
  notification,
  isOpen,
  onClose,
}: NotificationDetailsDialogProps) {
  if (!isOpen || !notification) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-details-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h2
            id="notification-details-title"
            style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}
          >
            Notification Details
          </h2>
          <NotificationStatusBadge status={notification.status} />
        </div>

        <Row label="Recipient" value={notification.recipient} />
        <Row label="Channel" value={notification.channel} />
        <Row label="Template" value={notification.template} />
        <Row label="Subject" value={notification.subject} />
        <Row label="Retries" value={`${notification.retryCount} / ${notification.maxRetries}`} />
        <Row label="Created" value={new Date(notification.createdAt).toLocaleString()} />
        {notification.processedAt && (
          <Row label="Processed" value={new Date(notification.processedAt).toLocaleString()} />
        )}
        {notification.sentAt && (
          <Row label="Sent" value={new Date(notification.sentAt).toLocaleString()} />
        )}
        {notification.errorMessage && (
          <Row
            label="Error"
            value={<span style={{ color: '#DC2626' }}>{notification.errorMessage}</span>}
          />
        )}

        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
            Body
          </div>
          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              color: '#374151',
              background: '#F8FAFC',
              maxHeight: '200px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {notification.body}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
