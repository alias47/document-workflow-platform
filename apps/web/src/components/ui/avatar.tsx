import { cn } from '@/lib/cn';

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' },
  green: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
  amber: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' },
  red: { bg: 'bg-[#FFE4E6]', text: 'text-[#B91C1C]' },
  violet: { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]' },
  teal: { bg: 'bg-[#CCFBF1]', text: 'text-[#0F766E]' },
};

const COLOR_KEYS = Object.keys(AVATAR_COLORS);

function resolveColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_KEYS[Math.abs(hash) % COLOR_KEYS.length] ?? 'blue';
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

interface AvatarProps {
  name: string;
  /** Override auto color */
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export function Avatar({ name, color, size = 'md', className }: AvatarProps) {
  const key = color ?? resolveColor(name);
  const palette = AVATAR_COLORS[key] ??
    AVATAR_COLORS['blue'] ?? { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' };
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0',
        palette.bg,
        palette.text,
        sizeMap[size],
        className,
      )}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
