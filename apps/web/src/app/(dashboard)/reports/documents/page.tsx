import { Suspense } from 'react';

import { DocumentReportClient } from '@/features/reports/components/DocumentReportClient';
import { ReportSkeleton } from '@/features/reports/components/ReportSkeleton';

export default function DocumentReportPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
          Document Report
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B' }}>
          Track document completion rates across applicants.
        </p>
      </div>

      <Suspense fallback={<ReportSkeleton />}>
        <DocumentReportClient />
      </Suspense>
    </div>
  );
}
