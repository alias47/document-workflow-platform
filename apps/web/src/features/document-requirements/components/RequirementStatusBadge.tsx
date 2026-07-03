import type { RequirementStatus } from '@/services/document-requirement.service';

const STATUS_CONFIG: Record<RequirementStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#92400E', bg: '#FEF3C7' },
  uploaded: { label: 'Uploaded', color: '#1D4ED8', bg: '#DBEAFE' },
  approved: { label: 'Approved', color: '#065F46', bg: '#D1FAE5' },
  rejected: { label: 'Rejected', color: '#991B1B', bg: '#FEE2E2' },
};

interface Props {
  status: RequirementStatus;
}

export function RequirementStatusBadge({ status }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

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
