import { Suspense } from 'react';

import { ReportSkeleton } from '@/features/reports/components/ReportSkeleton';
import { StaffWorkloadReportClient } from '@/features/reports/components/StaffWorkloadReportClient';

export default function StaffWorkloadReportPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
          Staff Workload Report
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B' }}>
          Review active and completed applicant counts per staff member.
        </p>
      </div>

      <Suspense fallback={<ReportSkeleton />}>
        <StaffWorkloadReportClient />
      </Suspense>
    </div>
  );
}
