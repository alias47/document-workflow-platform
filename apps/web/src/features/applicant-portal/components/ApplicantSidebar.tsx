'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

const navItems = [
  { label: 'Dashboard', href: '/applicant' },
  { label: 'Documents', href: '/applicant/documents' },
  { label: 'Profile', href: '/applicant/profile' },
];

export function ApplicantSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-semibold">Applicant Portal</span>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
