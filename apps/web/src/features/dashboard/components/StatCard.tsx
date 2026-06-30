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
    hover: 'hover:border-[#BFDBFE]',
    accent: 'bg-[#EFF6FF]',
  },
  amber: {
    icon: 'bg-[#FEF3C7] text-[#D97706]',
    hover: 'hover:border-[#FDE68A]',
    accent: 'bg-[#FFFBEB]',
  },
  violet: {
    icon: 'bg-[#EDE9FE] text-[#7C3AED]',
    hover: 'hover:border-[#DDD6FE]',
    accent: 'bg-[#F5F3FF]',
  },
  green: {
    icon: 'bg-[#DCFCE7] text-[#16A34A]',
    hover: 'hover:border-[#BBF7D0]',
    accent: 'bg-[#F0FDF4]',
  },
} as const;

const TREND_ICONS: Record<TrendDirection, LucideIcon> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

const TREND_COLORS: Record<TrendDirection, { text: string; bg: string }> = {
  up: { text: 'text-[#16A34A]', bg: 'bg-[#DCFCE7]' },
  down: { text: 'text-[#DC2626]', bg: 'bg-[#FFE4E6]' },
  neutral: { text: 'text-[#64748B]', bg: 'bg-[#F1F5F9]' },
};

interface StatCardProps {
  data: StatCardData;
}

export function StatCard({ data }: StatCardProps) {
  const Icon = ICON_MAP[data.iconName];
  const scheme = COLOR_SCHEMES[data.colorScheme];

  return (
    <div
      className={cn(
        'bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-5 transition-all duration-150',
        'hover:shadow-md cursor-default',
        scheme.hover,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn('w-10 h-10 rounded-[10px] flex items-center justify-center', scheme.icon)}
        >
          {Icon && <Icon size={20} />}
        </div>

        {/* Trend badge — more prominent pill */}
        {data.trend &&
          (() => {
            const TrendIcon = TREND_ICONS[data.trend.direction];
            const colors = TREND_COLORS[data.trend.direction];
            return (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
                  colors.text,
                  colors.bg,
                )}
              >
                <TrendIcon size={13} />
                <span>{data.trend.value}</span>
              </div>
            );
          })()}
      </div>

      <div>
        <p className="text-[28px] font-bold text-[#0F172A] leading-none mb-1">
          {String(data.value)}
        </p>
        <p className="text-sm text-[#64748B]">{data.label}</p>
        {data.trend && (
          <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">{data.trend.label}</p>
        )}
      </div>
    </div>
  );
}
