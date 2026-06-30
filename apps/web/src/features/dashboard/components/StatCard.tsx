import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  ClipboardList,
  FileText,
  type LucideIcon,
  Minus,
  Users,
} from 'lucide-react';

import type { StatCardData, TrendDirection } from '@/features/dashboard/types/dashboard.types';

import { cn } from '@/lib/cn';

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  ClipboardList,
  FileText,
  CheckCircle,
};

const COLOR_SCHEMES = {
  blue: {
    icon: 'bg-[#DBEAFE] text-[#2563EB]',
  },
  amber: {
    icon: 'bg-[#FEF3C7] text-[#D97706]',
  },
  violet: {
    icon: 'bg-[#EDE9FE] text-[#7C3AED]',
  },
  green: {
    icon: 'bg-[#DCFCE7] text-[#16A34A]',
  },
} as const;

const TREND_ICONS: Record<TrendDirection, LucideIcon> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

const TREND_COLORS: Record<TrendDirection, string> = {
  up: 'text-[#16A34A]',
  down: 'text-[#DC2626]',
  neutral: 'text-[#64748B]',
};

interface StatCardProps {
  data: StatCardData;
}

export function StatCard({ data }: StatCardProps) {
  const Icon = ICON_MAP[data.iconName];
  const scheme = COLOR_SCHEMES[data.colorScheme];

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn('w-10 h-10 rounded-[10px] flex items-center justify-center', scheme.icon)}
        >
          {Icon && <Icon size={20} />}
        </div>
        {data.trend &&
          (() => {
            const TrendIcon = TREND_ICONS[data.trend.direction];
            return (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-xs font-semibold',
                  TREND_COLORS[data.trend.direction],
                )}
              >
                <TrendIcon size={14} />
                <span>{data.trend.value}</span>
              </div>
            );
          })()}
      </div>

      <div>
        <p className="text-[28px] font-bold text-[#0F172A] leading-none mb-1">
          {data.value.toLocaleString()}
        </p>
        <p className="text-sm text-[#64748B]">{data.label}</p>
        {data.trend && <p className="text-xs text-[#94A3B8] mt-1">{data.trend.label}</p>}
      </div>
    </div>
  );
}
