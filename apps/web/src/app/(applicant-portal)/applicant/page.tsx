'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { ApplicantDashboardCards, useApplicantDashboard } from '@/features/applicant-portal';

export default function ApplicantDashboardPage() {
  const { data, isLoading, isError } = useApplicantDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load dashboard. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {data.applicant.firstName}</h1>
        <p className="text-sm text-gray-500">Applicant #{data.applicant.applicantNumber}</p>
      </div>

      <ApplicantDashboardCards dashboard={data} />

      {data.recentRequirements.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent Requirements</h2>
          <ul className="space-y-2">
            {data.recentRequirements.map((req) => (
              <li
                key={req.id}
                className="flex items-center justify-between rounded-lg border bg-white p-4 text-sm"
              >
                <span className="font-medium">{req.requirement.name}</span>
                <span className="capitalize text-gray-500">{req.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
