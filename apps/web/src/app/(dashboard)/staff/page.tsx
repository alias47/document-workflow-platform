import { Suspense } from 'react';

import { StaffListClient } from '@/features/staff/components/StaffListClient';
import { StaffTableSkeleton } from '@/features/staff/components/StaffTableSkeleton';

export const metadata = { title: 'Staff | Document Workflow' };

export default function StaffPage() {
  return (
    <Suspense fallback={<StaffTableSkeleton />}>
      <StaffListClient />
    </Suspense>
  );
}
