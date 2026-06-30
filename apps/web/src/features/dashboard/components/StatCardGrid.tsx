import { StatCard } from './StatCard';

import type { StatCardData } from '@/features/dashboard/types/dashboard.types';

interface StatCardGridProps {
  stats: StatCardData[];
}

export function StatCardGrid({ stats }: StatCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} data={stat} />
      ))}
    </div>
  );
}
