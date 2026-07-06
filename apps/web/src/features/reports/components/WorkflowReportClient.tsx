'use client';

import { ExportButton } from './ExportButton';
import { ReportEmptyState } from './ReportEmptyState';
import { ReportError } from './ReportError';
import { ReportSkeleton } from './ReportSkeleton';
import { useWorkflowReport } from '../hooks/use-reports';

import type { ExportFormat } from '../types';

import { reportService } from '@/services/report.service';

export function WorkflowReportClient() {
  const { data, isLoading, isError, refetch } = useWorkflowReport();

  async function handleExport(format: ExportFormat) {
    await reportService.exportWorkflowReport(format);
  }

  if (isLoading) return <ReportSkeleton />;
  if (isError) return <ReportError onRetry={() => void refetch()} />;

  const rows = data?.data ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ExportButton onExport={handleExport} disabled={rows.length === 0} />
      </div>

      {rows.length === 0 ? (
        <ReportEmptyState message="No workflow stages configured." />
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <th
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#64748B',
                  }}
                >
                  Stage
                </th>
                <th
                  style={{
                    padding: '10px 14px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: '#64748B',
                  }}
                >
                  Applicants
                </th>
                <th
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#64748B',
                  }}
                >
                  Distribution
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const total = rows.reduce((s, r) => s + r.applicantCount, 0);
                const pct = total > 0 ? Math.round((row.applicantCount / total) * 100) : 0;
                return (
                  <tr
                    key={row.stageId}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: i % 2 === 1 ? '#FAFAFA' : '#fff',
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 14px',
                        fontWeight: 500,
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {row.color && (
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: row.color,
                            flexShrink: 0,
                            display: 'inline-block',
                          }}
                        />
                      )}
                      {row.stageName}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#0F172A',
                      }}
                    >
                      {row.applicantCount}
                    </td>
                    <td style={{ padding: '10px 14px', width: '200px' }}>
                      <div
                        style={{
                          background: '#E2E8F0',
                          borderRadius: '100px',
                          height: '8px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            background: row.color ?? '#3B82F6',
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: '100px',
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#64748B',
                          marginTop: '2px',
                          display: 'block',
                        }}
                      >
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
