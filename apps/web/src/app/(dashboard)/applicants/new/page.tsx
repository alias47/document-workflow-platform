'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { CreateApplicantData } from '@/services/applicant.service';

import { useToast } from '@/components/ui/toast';
import { ApplicantForm } from '@/features/applicants/components/ApplicantForm';
import { useCreateApplicant } from '@/features/applicants/hooks/use-applicants';

export default function NewApplicantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateApplicant();

  async function handleSubmit(data: CreateApplicantData) {
    return new Promise<void>((resolve, reject) => {
      createMutation.mutate(data, {
        onSuccess: (res) => {
          toast({
            type: 'success',
            title: 'Applicant created',
            message: `${data.firstName} ${data.lastName} has been added.`,
          });
          const id = res.data?.id ?? res.data?.id;
          if (id) {
            router.push(`/applicants/${id}`);
          } else {
            router.push('/applicants');
          }
          resolve();
        },
        onError: (err) => {
          toast({
            type: 'error',
            title: 'Failed to create applicant',
            message: (err as Error)?.message ?? 'An unexpected error occurred.',
          });
          reject(err);
        },
      });
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
        <span style={{ color: '#0F172A', fontWeight: 500 }}>New Applicant</span>
      </div>

      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h2 className="page-title">Add Applicant</h2>
          <p className="page-subtitle">Create a new applicant profile</p>
        </div>
      </div>

      <ApplicantForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
