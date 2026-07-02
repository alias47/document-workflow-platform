'use client';

import { Search, X } from 'lucide-react';

import type { StaffListParams, StaffRole, StaffStatus } from '../types/staff.types';

import { Button } from '@/components/ui/button';

interface StaffFiltersProps {
  params: StaffListParams;
  roles: StaffRole[];
  onChange: (updates: Partial<StaffListParams>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: { value: StaffStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

export function StaffFilters({ params, roles, onChange, onClear }: StaffFiltersProps) {
  const hasFilters = Boolean(params.search || params.status || params.roleId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={params.search ?? ''}
          onChange={(e) => onChange({ search: e.target.value || undefined, page: 1 })}
          className="h-[38px] pl-9 pr-3 w-64 text-sm bg-white border border-[#E2E8F0] rounded-[8px] text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
          aria-label="Search staff"
        />
      </div>

      {/* Status filter */}
      <select
        value={params.status ?? ''}
        onChange={(e) =>
          onChange({ status: (e.target.value as StaffStatus) || undefined, page: 1 })
        }
        className="h-[38px] px-3 pr-8 text-sm bg-white border border-[#E2E8F0] rounded-[8px] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] appearance-none cursor-pointer"
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Role filter */}
      <select
        value={params.roleId ?? ''}
        onChange={(e) => onChange({ roleId: e.target.value || undefined, page: 1 })}
        className="h-[38px] px-3 pr-8 text-sm bg-white border border-[#E2E8F0] rounded-[8px] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] appearance-none cursor-pointer"
        aria-label="Filter by role"
      >
        <option value="">All Roles</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={`${params.sortBy ?? 'createdAt'}_${params.sortOrder ?? 'desc'}`}
        onChange={(e) => {
          const [field, order] = e.target.value.split('_') as [
            StaffListParams['sortBy'],
            StaffListParams['sortOrder'],
          ];
          onChange({ sortBy: field, sortOrder: order });
        }}
        className="h-[38px] px-3 pr-8 text-sm bg-white border border-[#E2E8F0] rounded-[8px] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] appearance-none cursor-pointer"
        aria-label="Sort by"
      >
        <option value="createdAt_desc">Newest First</option>
        <option value="createdAt_asc">Oldest First</option>
        <option value="firstName_asc">Name A–Z</option>
        <option value="firstName_desc">Name Z–A</option>
        <option value="lastLoginAt_desc">Last Login</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X size={13} />
          Clear filters
        </Button>
      )}
    </div>
  );
}
