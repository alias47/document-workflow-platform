import { FileUp, FolderPlus, LayoutList, UserPlus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ACTIONS = [
  {
    id: 'create-applicant',
    label: 'Create Applicant',
    description: 'Add a new applicant to the system',
    icon: UserPlus,
    colorClass: 'bg-[#DBEAFE] text-[#2563EB]',
    href: '/applicants/new',
  },
  {
    id: 'upload-document',
    label: 'Upload Document',
    description: 'Upload documents for an applicant',
    icon: FileUp,
    colorClass: 'bg-[#EDE9FE] text-[#7C3AED]',
    href: '/documents/upload',
  },
  {
    id: 'assign-task',
    label: 'Assign Task',
    description: 'Create and assign a new task',
    icon: LayoutList,
    colorClass: 'bg-[#FEF3C7] text-[#D97706]',
    href: '/tasks/new',
  },
  {
    id: 'view-reports',
    label: 'View Reports',
    description: 'Review workflow and activity reports',
    icon: FolderPlus,
    colorClass: 'bg-[#DCFCE7] text-[#16A34A]',
    href: '/reports',
  },
] as const;

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className="flex flex-col items-start gap-2 p-3 rounded-[10px] border border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#F8FAFC] transition-colors text-left group"
                aria-label={action.label}
              >
                <div
                  className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${action.colorClass}`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1E293B] group-hover:text-[#2563EB] transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
