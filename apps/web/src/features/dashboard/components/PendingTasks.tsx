import type { PendingTask, TaskPriority } from '@/features/dashboard/types/dashboard.types';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';

const PRIORITY_BADGE: Record<
  TaskPriority,
  { variant: 'danger' | 'warning' | 'secondary'; label: string }
> = {
  high: { variant: 'danger', label: 'High' },
  medium: { variant: 'warning', label: 'Medium' },
  low: { variant: 'secondary', label: 'Low' },
};

interface PendingTasksProps {
  tasks: PendingTask[];
  className?: string;
}

export function PendingTasks({ tasks, className }: PendingTasksProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pending Tasks</CardTitle>
        <span className="text-xs font-semibold text-white bg-[#EF4444] rounded-full w-5 h-5 flex items-center justify-center leading-none">
          {tasks.length}
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-0">
          {tasks.map((task, index) => {
            const priority = PRIORITY_BADGE[task.priority];
            return (
              <li
                key={task.id}
                className={cn(
                  'flex items-start gap-3 py-3',
                  index < tasks.length - 1 && 'border-b border-[#F1F5F9]',
                )}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] accent-[#2563EB] shrink-0 cursor-pointer"
                  aria-label={`Mark "${task.title}" as complete`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#1E293B] truncate">{task.title}</p>
                    <Badge variant={priority.variant}>{priority.label}</Badge>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5 truncate">{task.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-[#94A3B8]">Due: {task.dueDate}</span>
                    {task.assignee && (
                      <span className="text-[11px] text-[#94A3B8]">· {task.assignee}</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
