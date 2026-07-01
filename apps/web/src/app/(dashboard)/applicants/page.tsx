import { Suspense } from 'react';

import ApplicantsLoading from './loading';

import { ApplicantListClient } from '@/features/applicants/components/ApplicantListClient';

// Server Component — delegates state and data fetching to the client.
// Suspense boundary shows the skeleton while the client hydrates.
export default function ApplicantsPage() {
  return (
    <Suspense fallback={<ApplicantsLoading />}>
      <ApplicantListClient />
    </Suspense>
  );
}
