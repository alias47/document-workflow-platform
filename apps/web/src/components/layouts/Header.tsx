'use client';

import { Bell, LogOut, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/cn';

interface HeaderProps {
  title?: string;
  className?: string;
}

function formatRole(role: string): string {
  return role
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function Header({ title, className }: HeaderProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Account';
  const userRole = user ? formatRole(user.role) : '';

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
    }
  }

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

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-2.5 rounded-[8px] px-1.5 py-1 hover:bg-[#F1F5F9] transition-colors"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Open account menu"
        >
          <Avatar name={userName} size="md" />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-[#0F172A] leading-none">{userName}</p>
            {userRole && (
              <p className="text-[11px] text-[#64748B] mt-0.5 leading-none">{userRole}</p>
            )}
          </div>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-[10px] border border-[#E2E8F0] bg-white py-1.5 shadow-lg"
          >
            {user && (
              <div className="px-3 py-2 border-b border-[#F1F5F9]">
                <p className="text-sm font-semibold text-[#0F172A] truncate">{userName}</p>
                <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
              </div>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-60 transition-colors"
            >
              <LogOut size={16} />
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
