import { Suspense } from 'react';

import { ActivatePageClient } from '@/features/applicant-invitation/components/ActivatePageClient';

export const metadata = { title: 'Activate your account' };

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #E2E8F0',
                borderTopColor: '#2563EB',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                margin: '0 auto 12px',
              }}
            />
            <p style={{ fontSize: '14px', color: '#64748B' }}>Validating your invitation…</p>
          </div>
        </div>
      }
    >
      <ActivatePageClient />
    </Suspense>
  );
}
