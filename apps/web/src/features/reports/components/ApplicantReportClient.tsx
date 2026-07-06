'use client';

import { useState } from 'react';

import { ExportButton } from './ExportButton';
import { ReportEmptyState } from './ReportEmptyState';
import { ReportError } from './ReportError';
import { ReportFiltersBar } from './ReportFilters';
import { ReportPagination } from './ReportPagination';
import { ReportSkeleton } from './ReportSkeleton';
import { useApplicantReport } from '../hooks/use-reports';

import type { ExportFormat, ReportFilters } from '../types';

import { reportService } from '@/services/report.service';

const STATUS_COLOR: Record<string, string> = {
  active: '#16A34A',
  inactive: '#CA8A04',
  archived: '#94A3B8',
};

export function ApplicantReportClient() {
  const [filters, setFilters] = useState<ReportFilters>({ page: 1, pageSize: 25, sort: 'newest' });

  const { data, isLoading, isError, refetch } = useApplicantReport(filters);

  async function handleExport(format: ExportFormat) {
    await reportService.exportApplicantReport(filters, format);
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
        <ReportFiltersBar filters={filters} onChange={setFilters} showSort showStatus showCountry />
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
                    'Name',
                    'Email',
                    'Phone',
                    'Consultant',
                    'Stage',
                    'Status',
                    'Country',
                    'Created',
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
                      {row.name}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{row.email || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{row.phone || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>
                      {row.consultant || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>
                      {row.workflowStage || '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          color: STATUS_COLOR[row.status] ?? '#64748B',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{row.country || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{row.createdAt}</td>
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
