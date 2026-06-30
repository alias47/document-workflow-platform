'use client';

import { ChevronDown } from 'lucide-react';

import type { ApplicantStatus, WorkflowStage } from '@/features/applicants/types/applicant.types';

import { cn } from '@/lib/cn';

const STATUS_OPTIONS: { value: ApplicantStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const STAGE_OPTIONS: { value: WorkflowStage | 'all'; label: string }[] = [
  { value: 'all', label: 'All Stages' },
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'document_collection', label: 'Document Collection' },
  { value: 'application_submitted', label: 'Application Submitted' },
  { value: 'offer_received', label: 'Offer Received' },
  { value: 'visa_processing', label: 'Visa Processing' },
  { value: 'completed', label: 'Completed' },
];

interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

function SelectFilter({ value, onChange, options, className }: SelectFilterProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none pl-3 pr-8 rounded-[8px] border border-[#E2E8F0] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
      />
    </div>
  );
}

interface ApplicantFiltersProps {
  status: string;
  stage: string;
  assignedStaff: string;
  staffOptions: string[];
  onStatusChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onStaffChange: (value: string) => void;
  className?: string;
}

export function ApplicantFilters({
  status,
  stage,
  assignedStaff,
  staffOptions,
  onStatusChange,
  onStageChange,
  onStaffChange,
  className,
}: ApplicantFiltersProps) {
  const staffSelectOptions = [
    { value: 'all', label: 'All Staff' },
    ...staffOptions.map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <SelectFilter
        value={status}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
        className="min-w-[140px]"
      />
      <SelectFilter
        value={stage}
        onChange={onStageChange}
        options={STAGE_OPTIONS}
        className="min-w-[190px]"
      />
      <SelectFilter
        value={assignedStaff}
        onChange={onStaffChange}
        options={staffSelectOptions}
        className="min-w-[140px]"
      />
    </div>
  );
}
