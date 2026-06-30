import {
  ArrowRight,
  Check,
  CheckCircle,
  Upload,
  UserPlus,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import type { ActivityItem, ActivityType } from '@/features/dashboard/types/dashboard.types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';

const ICON_MAP: Record<string, LucideIcon> = {
  CheckCircle,
  UserPlus,
  Upload,
  ArrowRight,
  XCircle,
  Check,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  applicant_created: 'bg-[#DBEAFE] text-[#2563EB]',
  document_uploaded: 'bg-[#EDE9FE] text-[#7C3AED]',
  document_approved: 'bg-[#DCFCE7] text-[#16A34A]',
  document_rejected: 'bg-[#FFE4E6] text-[#DC2626]',
  workflow_updated: 'bg-[#F1F5F9] text-[#475569]',
  task_completed: 'bg-[#DCFCE7] text-[#16A34A]',
  comment_added: 'bg-[#FEF3C7] text-[#D97706]',
};

interface RecentActivityProps {
  items: ActivityItem[];
  className?: string;
}

export function RecentActivity({ items, className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <button
          type="button"
          className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          View all
        </button>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-0">
          {items.map((item, index) => {
            const Icon = ICON_MAP[item.iconName];
            const colorClass = ACTIVITY_COLORS[item.type];
            return (
              <li
                key={item.id}
                className={cn(
                  'flex items-start gap-3 py-3',
                  index < items.length - 1 && 'border-b border-[#F1F5F9]',
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    colorClass,
                  )}
                >
                  {Icon && <Icon size={13} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1E293B] leading-snug">
                    <span className="font-semibold">{item.actor}</span>{' '}
                    <span className="text-[#64748B]">{item.action}</span>{' '}
                    <span className="font-medium">{item.subject}</span>
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{item.timestamp}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
