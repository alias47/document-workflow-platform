import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  nameClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 'w-[30px] h-[30px]', name: 'text-[15px]', svg: 16 },
  md: { icon: 'w-[34px] h-[34px]', name: 'text-[16px]', svg: 18 },
  lg: { icon: 'w-[38px] h-[38px]', name: 'text-[21px]', svg: 19 },
};

export function Logo({ className, iconClassName, nameClassName, size = 'md' }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'bg-[#2563EB] rounded-[10px] flex items-center justify-center shrink-0',
          s.icon,
          iconClassName,
        )}
      >
        <svg width={s.svg} height={s.svg} viewBox="0 0 19 19" fill="none" aria-hidden="true">
          <path
            d="M3.5 5h12M3.5 9.5h8M3.5 14h10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className={cn('font-extrabold text-[#0F172A] tracking-tight', s.name, nameClassName)}>
        EduFlow
      </span>
    </div>
  );
}
