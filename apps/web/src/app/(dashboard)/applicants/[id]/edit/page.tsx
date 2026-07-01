'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import type { UpdateApplicantData } from '@/services/applicant.service';

import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ApplicantForm } from '@/features/applicants/components/ApplicantForm';
import { useApplicant, useUpdateApplicant } from '@/features/applicants/hooks/use-applicants';

export default function EditApplicantPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { toast } = useToast();

  const { data, isLoading, isError } = useApplicant(id);
  const updateMutation = useUpdateApplicant();

  if (isLoading) {
    return (
      <div className="page">
        <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-4)' }}>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="card">
          <div className="card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="page">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
          <p className="font-semibold text-[#0F172A]">Failed to load applicant</p>
          <Link href="/applicants" className="btn btn-primary">
            Back to Applicants
          </Link>
        </div>
      </div>
    );
  }

  const applicant = data.data;
  const fullName = `${applicant.firstName} ${applicant.lastName}`;

  async function handleSubmit(values: UpdateApplicantData) {
    return new Promise<void>((resolve, reject) => {
      updateMutation.mutate(
        { id, data: values },
        {
          onSuccess: () => {
            toast({
              type: 'success',
              title: 'Applicant updated',
              message: `${fullName}'s profile has been saved.`,
            });
            router.push(`/applicants/${id}`);
            resolve();
          },
          onError: (err) => {
            toast({
              type: 'error',
              title: 'Failed to update applicant',
              message: (err as Error)?.message ?? 'An unexpected error occurred.',
            });
            reject(err);
          },
        },
      );
    });
  }

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: 'var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          color: '#64748B',
        }}
      >
        <Link href="/applicants" style={{ color: '#64748B', textDecoration: 'none' }}>
          Applicants
        </Link>
        <span>/</span>
        <Link href={`/applicants/${id}`} style={{ color: '#64748B', textDecoration: 'none' }}>
          {fullName}
        </Link>
        <span>/</span>
        <span style={{ color: '#0F172A', fontWeight: 500 }}>Edit</span>
      </div>

      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 className="page-title">Edit Applicant</h2>
          <p className="page-subtitle">Update {fullName}&apos;s profile</p>
        </div>
      </div>

      <ApplicantForm
        mode="edit"
        defaultValues={{
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          middleName: applicant.middleName ?? '',
          email: applicant.email ?? '',
          phone: applicant.phone ?? '',
          gender: applicant.gender ?? '',
          dateOfBirth: applicant.dateOfBirth ?? '',
          nationality: applicant.nationality ?? '',
          address: applicant.address ?? '',
          city: applicant.city ?? '',
          country: applicant.country ?? '',
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
