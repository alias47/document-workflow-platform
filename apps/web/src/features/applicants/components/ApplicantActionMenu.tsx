'use client';

import { Archive, Eye, MoreHorizontal, Pencil } from 'lucide-react';

import { DropdownMenu } from '@/components/ui/dropdown-menu';

interface ApplicantActionMenuProps {
  applicantId: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function ApplicantActionMenu({
  applicantId,
  onView,
  onEdit,
  onArchive,
}: ApplicantActionMenuProps) {
  const items = [
    {
      label: 'View Profile',
      icon: <Eye size={14} />,
      onClick: () => onView?.(applicantId),
    },
    {
      label: 'Edit',
      icon: <Pencil size={14} />,
      onClick: () => onEdit?.(applicantId),
    },
    {
      label: 'Archive',
      icon: <Archive size={14} />,
      variant: 'danger' as const,
      onClick: () => onArchive?.(applicantId),
    },
  ];

  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          className="h-7 w-7 flex items-center justify-center rounded-[6px] text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors"
          aria-label="Actions"
        >
          <MoreHorizontal size={16} />
        </button>
      }
      items={items}
      align="right"
    />
  );
}
