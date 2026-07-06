'use client';

import type { PaginationMeta } from '@/types/api';

interface Props {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function ReportPagination({ meta, onPageChange }: Props) {
  const { page, totalPages, pageSize, totalItems } = meta;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        fontSize: '13px',
        color: '#64748B',
      }}
    >
      <span>{totalItems === 0 ? '0 results' : `${start}–${end} of ${totalItems}`}</span>

      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>
        <span
          style={{
            padding: '4px 10px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#1E293B',
            minWidth: '60px',
            textAlign: 'center',
          }}
        >
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
