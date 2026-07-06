'use client';

import type { NotificationStatus } from '../types';

export type StatusFilter = NotificationStatus | 'all';

interface NotificationFiltersProps {
  search: string;
  status: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  fontSize: '14px',
  color: '#0F172A',
  background: '#fff',
};

export function NotificationFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: NotificationFiltersProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}
    >
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by recipient or subject…"
        aria-label="Search notifications"
        style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        aria-label="Filter by status"
        style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
      >
        <option value="all">All statuses</option>
        <option value="queued">Queued</option>
        <option value="processing">Processing</option>
        <option value="sent">Sent</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  );
}
