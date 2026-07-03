import type { ReactNode } from 'react';

import { ApplicantHeader, ApplicantSidebar } from '@/features/applicant-portal';

export default function ApplicantDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ApplicantSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ApplicantHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
