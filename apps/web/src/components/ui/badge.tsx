import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        success: 'bg-[#DCFCE7] text-[#15803D]',
        warning: 'bg-[#FEF3C7] text-[#B45309]',
        danger: 'bg-[#FFE4E6] text-[#B91C1C]',
        info: 'bg-[#DBEAFE] text-[#1D4ED8]',
        secondary: 'bg-[#F1F5F9] text-[#475569]',
        outline: 'border border-[#E2E8F0] text-[#64748B] bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}
