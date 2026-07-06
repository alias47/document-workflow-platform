'use client';

import type { ReportFilters } from '../types';

interface Props {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  showSort?: boolean;
  showStatus?: boolean;
  showCountry?: boolean;
  showRole?: boolean;
}

export function ReportFiltersBar({
  filters,
  onChange,
  showSort = false,
  showStatus = false,
  showCountry = false,
  showRole = false,
}: Props) {
  function update(patch: Partial<ReportFilters>) {
    onChange({ ...filters, ...patch, page: 1 });
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        type="search"
        className="input input-sm"
        placeholder="Search…"
        value={filters.search ?? ''}
        onChange={(e) => update({ search: e.target.value || undefined })}
        style={{ minWidth: '200px' }}
        aria-label="Search"
      />

      {showStatus && (
        <select
          className="input input-sm"
          value={filters.status ?? ''}
          onChange={(e) => update({ status: e.target.value || undefined })}
          aria-label="Status"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      )}

      {showCountry && (
        <input
          type="text"
          className="input input-sm"
          placeholder="Country"
          value={filters.country ?? ''}
          onChange={(e) => update({ country: e.target.value || undefined })}
          aria-label="Country"
        />
      )}

      {showSort && (
        <select
          className="input input-sm"
          value={filters.sort ?? 'newest'}
          onChange={(e) => update({ sort: (e.target.value as ReportFilters['sort']) || undefined })}
          aria-label="Sort"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A–Z</option>
        </select>
      )}

      {showRole && (
        <input
          type="text"
          className="input input-sm"
          placeholder="Role ID"
          value={filters.roleId ?? ''}
          onChange={(e) => update({ roleId: e.target.value || undefined })}
          aria-label="Role"
        />
      )}

      {(filters.search || filters.status || filters.country || filters.roleId) && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onChange({ page: 1, pageSize: filters.pageSize, sort: filters.sort })}
          style={{ color: '#64748B' }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
