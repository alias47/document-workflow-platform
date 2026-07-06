import type { InvitationStatus } from '../types';

const STATUS_CONFIG: Record<InvitationStatus, { label: string; color: string; dotColor: string }> =
  {
    pending: { label: 'Pending', color: '#FEF9C3', dotColor: '#CA8A04' },
    accepted: { label: 'Activated', color: '#DCFCE7', dotColor: '#16A34A' },
    expired: { label: 'Expired', color: '#F1F5F9', dotColor: '#64748B' },
    revoked: { label: 'Revoked', color: '#FFE4E6', dotColor: '#DC2626' },
    none: { label: 'Not Invited', color: '#F1F5F9', dotColor: '#94A3B8' },
  };

interface Props {
  status: InvitationStatus;
}

export function InvitationStatusBadge({ status }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 10px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 500,
        background: cfg.color,
        color: cfg.dotColor,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: cfg.dotColor,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
