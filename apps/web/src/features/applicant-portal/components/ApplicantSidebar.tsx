'use client';

import { FileText, LayoutDashboard, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/ui/logo';
import { PORTAL_NAV } from '@/constants/navigation';
import { cn } from '@/lib/cn';

const ICON_MAP: Record<string, typeof LayoutDashboard> = {
  Overview: LayoutDashboard,
  Documents: FileText,
  Profile: User,
};

export function ApplicantSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[#E2E8F0] bg-white">
      <div className="flex h-16 items-center border-b border-[#E2E8F0] px-6">
        <Logo size="sm" />
      </div>
      <nav
        className="flex-1 overflow-y-auto p-4 space-y-0.5"
        aria-label="Applicant portal navigation"
      >
        {PORTAL_NAV.map((item) => {
          const Icon = ICON_MAP[item.label];
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
              )}
              aria-current={active ? 'page' : undefined}
            >
              {Icon && <Icon size={16} aria-hidden="true" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
