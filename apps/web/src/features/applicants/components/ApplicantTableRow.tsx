import Link from 'next/link';

import { ApplicantActionMenu } from './ApplicantActionMenu';
import { ApplicantStatusBadge } from './ApplicantStatusBadge';

import type { Applicant } from '@/features/applicants/types/applicant.types';

import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';

interface ApplicantTableRowProps {
  applicant: Applicant;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}

const STAGE_PROGRESS_COLOR: Record<string, string> = {
  inquiry: 'bg-[#94A3B8]',
  document_collection: 'bg-[#F59E0B]',
  application_submitted: 'bg-[#3B82F6]',
  offer_received: 'bg-[#8B5CF6]',
  visa_processing: 'bg-[#F97316]',
  completed: 'bg-[#22C55E]',
};

export function ApplicantTableRow({ applicant, selected, onSelect }: ApplicantTableRowProps) {
  const fullName = `${applicant.firstName} ${applicant.lastName}`;
  const progressColor = STAGE_PROGRESS_COLOR[applicant.workflow.currentStage] ?? 'bg-[#94A3B8]';

  return (
    <tr
      className={cn(
        'border-b border-[#F1F5F9] transition-colors',
        selected ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]',
      )}
    >
      {/* Row checkbox */}
      <td className="px-4 py-3 w-[44px]" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-[#CBD5E1] accent-[#2563EB] cursor-pointer"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          aria-label={`Select ${fullName}`}
        />
      </td>

      {/* Applicant */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={fullName} size="md" />
          <div>
            <Link
              href={`/applicants/${applicant.id}`}
              className="text-sm font-semibold text-[#1E293B] hover:text-[#2563EB] transition-colors"
            >
              {fullName}
            </Link>
            <p className="text-xs text-[#94A3B8] mt-0.5">{applicant.email}</p>
          </div>
        </div>
      </td>

      {/* ID */}
      <td className="px-4 py-3">
        <span className="text-xs font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">
          {applicant.applicantNumber}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <ApplicantStatusBadge status={applicant.status} />
      </td>

      {/* Workflow stage + progress */}
      <td className="px-4 py-3">
        <div>
          <p className="text-xs font-medium text-[#475569]">{applicant.workflow.stageName}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden max-w-[80px]">
              <div
                className={`h-full rounded-full ${progressColor}`}
                style={{ width: `${applicant.workflow.completionPercentage}%` }}
              />
            </div>
            <span className="text-[10px] text-[#94A3B8] font-medium">
              {applicant.workflow.completionPercentage}%
            </span>
          </div>
        </div>
      </td>

      {/* Documents */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#16A34A] font-semibold">{applicant.documents.approved}</span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-[#475569]">{applicant.documents.total}</span>
          {applicant.documents.missing > 0 && (
            <span className="text-[#EF4444] font-medium ml-1">
              ({applicant.documents.missing} missing)
            </span>
          )}
        </div>
      </td>

      {/* Staff */}
      <td className="px-4 py-3">
        <p className="text-sm text-[#475569]">{applicant.assignedStaff}</p>
      </td>

      {/* Date */}
      <td className="px-4 py-3">
        <p className="text-xs text-[#94A3B8]">
          {new Date(applicant.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <ApplicantActionMenu
          applicantId={applicant.id}
          onView={() => {}}
          onEdit={() => {}}
          onArchive={() => {}}
        />
      </td>
    </tr>
  );
}
