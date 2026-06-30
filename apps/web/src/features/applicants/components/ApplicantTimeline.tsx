import {
  ArrowRight,
  CheckCircle,
  FileText,
  PauseCircle,
  Upload,
  UserPlus,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import type { TimelineEntry } from '@/features/applicants/types/applicant.types';

import { cn } from '@/lib/cn';

const EVENT_ICONS: Record<string, LucideIcon> = {
  applicant_created: UserPlus,
  invitation_sent: UserPlus,
  portal_activated: CheckCircle,
  document_uploaded: Upload,
  document_approved: CheckCircle,
  document_rejected: XCircle,
  workflow_updated: ArrowRight,
  status_changed: PauseCircle,
  comment_added: FileText,
};

const EVENT_COLORS: Record<string, string> = {
  applicant_created: 'bg-[#DBEAFE] text-[#2563EB]',
  invitation_sent: 'bg-[#DBEAFE] text-[#2563EB]',
  portal_activated: 'bg-[#DCFCE7] text-[#16A34A]',
  document_uploaded: 'bg-[#EDE9FE] text-[#7C3AED]',
  document_approved: 'bg-[#DCFCE7] text-[#16A34A]',
  document_rejected: 'bg-[#FFE4E6] text-[#DC2626]',
  workflow_updated: 'bg-[#F1F5F9] text-[#475569]',
  status_changed: 'bg-[#FEF3C7] text-[#D97706]',
  comment_added: 'bg-[#F1F5F9] text-[#475569]',
};

interface ApplicantTimelineProps {
  entries: TimelineEntry[];
  className?: string;
}

export function ApplicantTimeline({ entries, className }: ApplicantTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className={cn('bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-5', className)}>
      <h3 className="text-sm font-semibold text-[#0F172A] mb-5">Activity Timeline</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-[#E2E8F0]" />

        <ul className="space-y-5">
          {sorted.map((entry) => {
            const Icon = EVENT_ICONS[entry.eventType] ?? FileText;
            const colorClass = EVENT_COLORS[entry.eventType] ?? 'bg-[#F1F5F9] text-[#475569]';
            const date = new Date(entry.createdAt);

            return (
              <li key={entry.id} className="flex gap-3 relative">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10',
                    colorClass,
                  )}
                >
                  <Icon size={12} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-[#1E293B]">{entry.eventTitle}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{entry.eventDescription}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-[#94A3B8]">{entry.createdBy}</span>
                    <span className="text-[#CBD5E1]">·</span>
                    <span className="text-[11px] text-[#94A3B8]">
                      {date.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
