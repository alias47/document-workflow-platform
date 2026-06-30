import { Archive, Download, Users } from 'lucide-react';

import { ApplicantTableRow } from './ApplicantTableRow';

import type { Applicant } from '@/features/applicants/types/applicant.types';

import { Pagination } from '@/components/ui/pagination';

const HEADER_COLS = [
  { label: 'Applicant', width: 'w-[220px]' },
  { label: 'ID', width: 'w-[130px]' },
  { label: 'Status', width: 'w-[110px]' },
  { label: 'Workflow Stage', width: 'w-[170px]' },
  { label: 'Documents', width: 'w-[130px]' },
  { label: 'Assigned Staff', width: 'w-[130px]' },
  { label: 'Created', width: 'w-[100px]' },
  { label: '', width: 'w-[50px]' },
];

interface ApplicantTableProps {
  applicants: Applicant[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  selectedIds: Set<string>;
  onSelectId: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onBulkArchive: () => void;
  onBulkExport: () => void;
}

export function ApplicantTable({
  applicants,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  selectedIds,
  onSelectId,
  onSelectAll,
  onBulkArchive,
  onBulkExport,
}: ApplicantTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const allSelected = applicants.length > 0 && applicants.every((a) => selectedIds.has(a.id));
  const someSelected = applicants.some((a) => selectedIds.has(a.id));
  const selectionCount = selectedIds.size;

  if (applicants.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
            <Users size={24} className="text-[#94A3B8]" />
          </div>
          <h3 className="text-base font-semibold text-[#1E293B] mb-1.5">No applicants found</h3>
          <p className="text-sm text-[#64748B] max-w-xs leading-relaxed">
            Try adjusting your search terms or filters to find what you&apos;re looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Bulk action bar — appears only when rows are selected */}
      {selectionCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#EFF6FF] border-b border-[#DBEAFE]">
          <span className="text-sm font-semibold text-[#1D4ED8]">{selectionCount} selected</span>
          <div className="flex items-center gap-2 ml-2">
            <button
              type="button"
              onClick={onBulkArchive}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] rounded-[7px] px-3 py-1.5 transition-colors"
            >
              <Archive size={13} />
              Archive selected
            </button>
            <button
              type="button"
              onClick={onBulkExport}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] rounded-[7px] px-3 py-1.5 transition-colors"
            >
              <Download size={13} />
              Export selected
            </button>
          </div>
          <button
            type="button"
            onClick={() => onSelectAll(false)}
            className="ml-auto text-xs text-[#64748B] hover:text-[#1E293B] transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {/* Select-all header checkbox */}
              <th className="px-4 py-3 w-[44px]">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#CBD5E1] accent-[#2563EB] cursor-pointer"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  aria-label="Select all applicants on this page"
                />
              </th>
              {HEADER_COLS.map((col) => (
                <th
                  key={col.label}
                  className={`px-4 py-3 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wide ${col.width}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => (
              <ApplicantTableRow
                key={applicant.id}
                applicant={applicant}
                selected={selectedIds.has(applicant.id)}
                onSelect={(checked) => onSelectId(applicant.id, checked)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="border-t border-[#F1F5F9] px-4 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
