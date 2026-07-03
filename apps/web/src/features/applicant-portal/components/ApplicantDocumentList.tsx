'use client';

import { useState } from 'react';

import { ApplicantDocumentCard } from './ApplicantDocumentCard';
import { ApplicantUploadDialog } from './ApplicantUploadDialog';
import { useApplicantDocumentRequirements } from '../hooks/use-applicant-portal';

import type { RequirementStatus } from '../types';

import { Skeleton } from '@/components/ui/skeleton';

const STATUS_ORDER: RequirementStatus[] = ['pending', 'uploaded', 'rejected', 'approved'];

export function ApplicantDocumentList() {
  const { data, isLoading, isError } = useApplicantDocumentRequirements();
  const [uploadTarget, setUploadTarget] = useState<{
    requirementId: string;
    requirementName: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load document requirements. Please refresh and try again.
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
        No document requirements assigned yet.
      </div>
    );
  }

  const sorted = [...data].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  return (
    <>
      <div className="space-y-4">
        {sorted.map((req) => (
          <ApplicantDocumentCard
            key={req.id}
            requirement={req}
            onUpload={(id) =>
              setUploadTarget({ requirementId: id, requirementName: req.requirement.name })
            }
          />
        ))}
      </div>

      {uploadTarget && (
        <ApplicantUploadDialog
          requirementId={uploadTarget.requirementId}
          requirementName={uploadTarget.requirementName}
          onClose={() => setUploadTarget(null)}
        />
      )}
    </>
  );
}
