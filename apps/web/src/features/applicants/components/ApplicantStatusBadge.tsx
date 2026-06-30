import type {
  ApplicantStatus,
  PortalAccountStatus,
} from '@/features/applicants/types/applicant.types';

import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG: Record<
  ApplicantStatus,
  { variant: 'success' | 'warning' | 'secondary' | 'danger'; label: string }
> = {
  active: { variant: 'success', label: 'Active' },
  on_hold: { variant: 'warning', label: 'On Hold' },
  completed: { variant: 'info' as 'success', label: 'Completed' },
  archived: { variant: 'secondary', label: 'Archived' },
};

// Fix: completed uses info variant via direct class override
const STATUS_CLASSES: Partial<Record<ApplicantStatus, string>> = {
  completed: 'bg-[#DBEAFE] text-[#1D4ED8]',
};

const PORTAL_CONFIG: Record<
  PortalAccountStatus,
  { variant: 'success' | 'warning' | 'secondary' | 'danger'; label: string }
> = {
  pending: { variant: 'secondary', label: 'Pending' },
  invitation_sent: { variant: 'warning', label: 'Invited' },
  active: { variant: 'success', label: 'Portal Active' },
  suspended: { variant: 'danger', label: 'Suspended' },
};

interface ApplicantStatusBadgeProps {
  status: ApplicantStatus;
}

interface PortalStatusBadgeProps {
  status: PortalAccountStatus;
}

export function ApplicantStatusBadge({ status }: ApplicantStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const extra = STATUS_CLASSES[status];
  return (
    <Badge variant={config.variant} className={extra}>
      {config.label}
    </Badge>
  );
}

export function PortalStatusBadge({ status }: PortalStatusBadgeProps) {
  const config = PORTAL_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
