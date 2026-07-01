'use client';

import {
  Activity,
  Bell,
  Clock,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { ADMIN_NAV, type NavSection } from '@/constants/navigation';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/cn';

function formatRole(role: string): string {
  return role
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Bell,
  Settings,
  Upload,
  Clock,
};

interface SidebarProps {
  nav?: NavSection[];
}

function NavLink({
  href,
  iconName,
  label,
  badge,
}: {
  href: string;
  iconName: string;
  label: string;
  badge?: string;
}) {
  const pathname = usePathname();
  const Icon = ICON_MAP[iconName];
  const active = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-[9px] rounded-[8px] text-sm font-medium transition-colors',
        active ? 'bg-[#2563EB] text-white' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white',
      )}
    >
      {Icon && <Icon size={18} className="shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none',
            active ? 'bg-white/20 text-white' : 'bg-[#1E3A5F] text-[#93C5FD]',
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ nav = ADMIN_NAV }: SidebarProps) {
  const { user } = useAuth();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Account';
  const userRole = user ? formatRole(user.role) : '';

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col bg-[#0F172A] border-r border-[#1E293B]">
      {/* Logo */}
      <div className="flex items-center h-[60px] px-5 border-b border-[#1E293B] shrink-0">
        <Logo size="md" nameClassName="text-white" iconClassName="bg-[#2563EB]" />
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
        {nav.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#475569]">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink {...item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 px-3 py-4 border-t border-[#1E293B]">
        <div className="flex items-center gap-3 px-2">
          <Avatar name={userName} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-[11px] text-[#64748B] truncate">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
