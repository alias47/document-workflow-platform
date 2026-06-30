import type { Applicant, WorkflowStage } from '@/features/applicants/types/applicant.types';

import { cn } from '@/lib/cn';

const STAGES: { key: WorkflowStage; label: string }[] = [
  { key: 'inquiry', label: 'Inquiry' },
  { key: 'document_collection', label: 'Documents' },
  { key: 'application_submitted', label: 'Application' },
  { key: 'offer_received', label: 'Offer' },
  { key: 'visa_processing', label: 'Visa' },
  { key: 'completed', label: 'Completed' },
];

function getStageIndex(stage: WorkflowStage): number {
  return STAGES.findIndex((s) => s.key === stage);
}

interface ApplicantWorkflowCardProps {
  applicant: Applicant;
}

export function ApplicantWorkflowCard({ applicant }: ApplicantWorkflowCardProps) {
  const currentIndex = getStageIndex(applicant.workflow.currentStage);
  const { completionPercentage, stageName } = applicant.workflow;

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#0F172A]">Workflow Progress</h3>
        <span className="text-xs font-bold text-[#2563EB]">{completionPercentage}% Complete</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-[#2563EB] rounded-full transition-all"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Stage stepper */}
      <div className="flex items-start gap-0 overflow-x-auto">
        {STAGES.map((stage, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STAGES.length - 1;

          return (
            <div key={stage.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-2 ring-offset-1',
                    isDone
                      ? 'bg-[#2563EB] text-white ring-[#2563EB]'
                      : isCurrent
                        ? 'bg-white text-[#2563EB] ring-[#2563EB]'
                        : 'bg-[#F1F5F9] text-[#94A3B8] ring-[#E2E8F0]',
                  )}
                >
                  {isDone ? '✓' : index + 1}
                </div>
                <p
                  className={cn(
                    'text-[10px] font-medium mt-1.5 text-center leading-tight max-w-[60px]',
                    isCurrent ? 'text-[#2563EB]' : isDone ? 'text-[#64748B]' : 'text-[#94A3B8]',
                  )}
                >
                  {stage.label}
                </p>
              </div>
              {!isLast && (
                <div
                  className={cn('h-0.5 flex-1 -mt-3.5', isDone ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]')}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#64748B] mt-4">
        Current stage: <span className="font-semibold text-[#1E293B]">{stageName}</span>
      </p>
    </div>
  );
}
