import { Suspense } from 'react';

import { ReportSkeleton } from '@/features/reports/components/ReportSkeleton';
import { WorkflowReportClient } from '@/features/reports/components/WorkflowReportClient';

export default function WorkflowReportPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
          Workflow Report
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B' }}>
          Current distribution of applicants across workflow stages.
        </p>
      </div>

      <Suspense fallback={<ReportSkeleton />}>
        <WorkflowReportClient />
      </Suspense>
    </div>
  );
}
