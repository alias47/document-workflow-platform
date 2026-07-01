import type { DocumentStatus } from '@/services/document.service';

import { cn } from '@/lib/cn';

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; className: string; dotClassName: string }
> = {
  pending: {
    label: 'Pending',
    className: 'badge badge-warning',
    dotClassName: 'badge-dot badge-warning',
  },
  verified: {
    label: 'Verified',
    className: 'badge badge-success',
    dotClassName: 'badge-dot badge-success',
  },
  rejected: {
    label: 'Rejected',
    className: 'badge badge-danger',
    dotClassName: 'badge-dot badge-danger',
  },
  expired: {
    label: 'Expired',
    className: 'badge badge-neutral',
    dotClassName: 'badge-dot badge-neutral',
  },
  archived: {
    label: 'Archived',
    className: 'badge badge-neutral',
    dotClassName: 'badge-dot badge-neutral',
  },
};

interface Props {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={cn(config.className, className)}>
      <span className={config.dotClassName} />
      {config.label}
    </span>
  );
}
