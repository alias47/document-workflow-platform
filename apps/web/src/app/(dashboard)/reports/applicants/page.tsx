import { Suspense } from 'react';

import { ApplicantReportClient } from '@/features/reports/components/ApplicantReportClient';
import { ReportSkeleton } from '@/features/reports/components/ReportSkeleton';

export default function ApplicantReportPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
          Applicant Report
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B' }}>
          View and export applicant data. Filters apply to both the table and exports.
        </p>
      </div>

      <Suspense fallback={<ReportSkeleton />}>
        <ApplicantReportClient />
      </Suspense>
    </div>
  );
}
