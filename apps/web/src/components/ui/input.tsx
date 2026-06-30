import * as React from 'react';

import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[46px] w-full rounded-[10px] border-[1.5px] border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm text-[#0F172A] transition-colors',
          'placeholder:text-[#94A3B8]',
          'hover:border-[#CBD5E1]',
          'focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#DBEAFE] focus:bg-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
