import type { ReactNode } from 'react';

export default function ApplicantPortalLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
