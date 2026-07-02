'use client';

import { MoreHorizontal, Users } from 'lucide-react';
import Link from 'next/link';

import { StaffStatusBadge } from './StaffStatusBadge';

import type { Staff } from '../types/staff.types';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';

interface StaffTableProps {
  staff: Staff[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEdit: (staff: Staff) => void;
  onToggleStatus: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
}

const HEADER_COLS = [
  { label: 'Staff', width: 'w-[220px]' },
  { label: 'Email', width: 'w-[200px]' },
  { label: 'Phone', width: 'w-[140px]' },
  { label: 'Role', width: 'w-[130px]' },
  { label: 'Status', width: 'w-[100px]' },
  { label: 'Applicants', width: 'w-[100px]' },
  { label: 'Last Login', width: 'w-[130px]' },
  { label: '', width: 'w-[50px]' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function StaffTable({
  staff,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
}: StaffTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (staff.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
            <Users size={24} className="text-[#94A3B8]" />
          </div>
          <h3 className="text-base font-semibold text-[#1E293B] mb-1.5">No staff members found</h3>
          <p className="text-sm text-[#64748B] max-w-xs leading-relaxed">
            Try adjusting your search terms or filters to find who you&apos;re looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
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
            {staff.map((member) => (
              <tr
                key={member.id}
                className="border-b border-[#F1F5F9] hover:bg-[#FAFAFA] transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/staff/${member.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar name={`${member.firstName} ${member.lastName}`} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1E293B] truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      {member.jobTitle && (
                        <p className="text-[11px] text-[#64748B] truncate">{member.jobTitle}</p>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#475569] truncate block max-w-[190px]">
                    {member.email}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#475569]">{member.phone ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  {member.role ? (
                    <Badge variant="info">{member.role.name}</Badge>
                  ) : (
                    <span className="text-sm text-[#94A3B8]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StaffStatusBadge status={member.status} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-[#1E293B]">
                    {member.assignedApplicantCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#64748B]">{formatDate(member.lastLoginAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <StaffActionMenu
                    staff={member}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
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

function StaffActionMenu({
  staff,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  staff: Staff;
  onEdit: (s: Staff) => void;
  onToggleStatus: (s: Staff) => void;
  onDelete: (s: Staff) => void;
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors"
        aria-label={`Actions for ${staff.firstName} ${staff.lastName}`}
      >
        <MoreHorizontal size={15} />
      </button>
      <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E2E8F0] rounded-[8px] shadow-lg py-1 z-20 hidden group-focus-within:block group-hover:block">
        <button
          type="button"
          onClick={() => onEdit(staff)}
          className="w-full text-left px-3 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onToggleStatus(staff)}
          className="w-full text-left px-3 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
        >
          {staff.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <div className="border-t border-[#F1F5F9] my-1" />
        <button
          type="button"
          onClick={() => onDelete(staff)}
          className="w-full text-left px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FFF1F2] transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
