'use client';

interface RetryNotificationDialogProps {
  recipient: string;
  isOpen: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RetryNotificationDialog({
  recipient,
  isOpen,
  isPending,
  onConfirm,
  onCancel,
}: RetryNotificationDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retry-notification-title"
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
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <h2
          id="retry-notification-title"
          style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}
        >
          Retry Notification
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
          Re-attempt delivery of this notification to <strong>{recipient}</strong>? This will
          increment the retry count.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      </div>
    </div>
  );
}
