import type { StaffStatus } from '../types/staff.types';

import { Badge } from '@/components/ui/badge';

const STATUS_MAP: Record<
  StaffStatus,
  { label: string; variant: 'success' | 'danger' | 'warning' }
> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'danger' },
  suspended: { label: 'Suspended', variant: 'warning' },
};

interface StaffStatusBadgeProps {
  status: StaffStatus;
}

export function StaffStatusBadge({ status }: StaffStatusBadgeProps) {
  const { label, variant } = STATUS_MAP[status] ?? STATUS_MAP.inactive;
  return <Badge variant={variant}>{label}</Badge>;
}
