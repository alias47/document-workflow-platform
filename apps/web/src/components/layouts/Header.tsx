'use client';

import { Bell, Search } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';

interface HeaderProps {
  title?: string;
  userName?: string;
  userRole?: string;
  className?: string;
}

export function Header({
  title,
  userName = 'Admin User',
  userRole = 'Administrator',
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 left-[240px] right-0 z-20 h-[60px] flex items-center gap-4 px-6 bg-white border-b border-[#E2E8F0]',
        className,
      )}
    >
      {/* Page title */}
      {title && <h1 className="text-base font-semibold text-[#0F172A] mr-4 shrink-0">{title}</h1>}

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
        />
        <input
          type="search"
          placeholder="Search..."
          className="w-full h-9 pl-9 pr-3 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] focus:bg-white transition-colors"
        />
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <button
        type="button"
        className="relative h-9 w-9 flex items-center justify-center rounded-[8px] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
      </button>

      {/* User */}
      <div className="flex items-center gap-2.5">
        <Avatar name={userName} size="md" />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[#0F172A] leading-none">{userName}</p>
          <p className="text-[11px] text-[#64748B] mt-0.5 leading-none">{userRole}</p>
        </div>
      </div>
    </header>
  );
}
