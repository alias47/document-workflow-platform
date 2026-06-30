import { CalendarClock } from 'lucide-react';

import type { DeadlineItem, DeadlineStatus } from '@/features/dashboard/types/dashboard.types';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';

const STATUS_CONFIG: Record<
  DeadlineStatus,
  { variant: 'danger' | 'warning' | 'secondary'; label: string }
> = {
  overdue: { variant: 'danger', label: 'Overdue' },
  due_soon: { variant: 'warning', label: 'Due Soon' },
  upcoming: { variant: 'secondary', label: 'Upcoming' },
};

interface UpcomingDeadlinesProps {
  deadlines: DeadlineItem[];
  className?: string;
}

export function UpcomingDeadlines({ deadlines, className }: UpcomingDeadlinesProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CalendarClock size={16} className="text-[#94A3B8]" />
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-0">
          {deadlines.map((deadline, index) => {
            const config = STATUS_CONFIG[deadline.status];
            return (
              <li
                key={deadline.id}
                className={cn(
                  'flex items-center justify-between gap-3 py-3',
                  index < deadlines.length - 1 && 'border-b border-[#F1F5F9]',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1E293B] truncate">{deadline.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5 truncate">{deadline.applicantName}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <span className="text-[11px] text-[#94A3B8]">{deadline.dueDate}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
