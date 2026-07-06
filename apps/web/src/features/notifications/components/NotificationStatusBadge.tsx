import type { NotificationStatus } from '../types';

const STATUS_CONFIG: Record<NotificationStatus, { label: string; color: string; bg: string }> = {
  queued: { label: 'Queued', color: '#92400E', bg: '#FEF3C7' },
  processing: { label: 'Processing', color: '#1D4ED8', bg: '#DBEAFE' },
  sent: { label: 'Sent', color: '#065F46', bg: '#D1FAE5' },
  failed: { label: 'Failed', color: '#991B1B', bg: '#FEE2E2' },
};

interface Props {
  status: NotificationStatus;
}

export function NotificationStatusBadge({ status }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}
