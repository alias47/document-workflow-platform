'use client';

interface NotificationErrorProps {
  onRetry: () => void;
}

export function NotificationError({ onRetry }: NotificationErrorProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
        Failed to load notifications
      </p>
      <p style={{ fontSize: '13px', color: '#64748B' }}>
        An error occurred while fetching notification history.
      </p>
      <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
