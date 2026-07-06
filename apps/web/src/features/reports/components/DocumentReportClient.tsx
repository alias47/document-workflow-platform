'use client';

import { useState } from 'react';

import { ExportButton } from './ExportButton';
import { ReportEmptyState } from './ReportEmptyState';
import { ReportError } from './ReportError';
import { ReportFiltersBar } from './ReportFilters';
import { ReportPagination } from './ReportPagination';
import { ReportSkeleton } from './ReportSkeleton';
import { useDocumentReport } from '../hooks/use-reports';

import type { ExportFormat, ReportFilters } from '../types';

import { reportService } from '@/services/report.service';

export function DocumentReportClient() {
  const [filters, setFilters] = useState<ReportFilters>({ page: 1, pageSize: 25 });

  const { data, isLoading, isError, refetch } = useDocumentReport(filters);

  async function handleExport(format: ExportFormat) {
    await reportService.exportDocumentReport(filters, format);
  }

  if (isLoading) return <ReportSkeleton />;
  if (isError) return <ReportError onRetry={() => void refetch()} />;

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <ReportFiltersBar filters={filters} onChange={setFilters} />
        <ExportButton onExport={handleExport} disabled={rows.length === 0} />
      </div>

      {rows.length === 0 ? (
        <ReportEmptyState />
      ) : (
        <>
          <div className="card" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  {[
                    'Applicant',
                    'Email',
                    'Total',
                    'Uploaded',
                    'Approved',
                    'Rejected',
                    'Pending',
                    'Completion',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#64748B',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: i % 2 === 1 ? '#FAFAFA' : '#fff',
                    }}
                  >
                    <td style={{ padding: '10px 14px', fontWeight: 500, color: '#0F172A' }}>
                      {row.applicant}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{row.email || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>
                      {row.totalRequirements}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{row.uploaded}</td>
                    <td style={{ padding: '10px 14px', color: '#16A34A', fontWeight: 500 }}>
                      {row.approved}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#DC2626', fontWeight: 500 }}>
                      {row.rejected}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#CA8A04', fontWeight: 500 }}>
                      {row.pending}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: 500,
                          background:
                            parseInt(row.completionPercent) >= 100 ? '#DCFCE7' : '#FEF9C3',
                          color: parseInt(row.completionPercent) >= 100 ? '#16A34A' : '#CA8A04',
                        }}
                      >
                        {row.completionPercent}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && (
            <ReportPagination
              meta={meta}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          )}
        </>
      )}
    </div>
  );
}
