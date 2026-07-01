'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { type ApplicantListParams, applicantService } from '@/services/applicant.service';

// ---------- List ----------

export function useApplicants(params: ApplicantListParams = {}) {
  return useQuery({
    queryKey: queryKeys.applicants.list(params as Record<string, unknown>),
    queryFn: () => applicantService.list(params),
  });
}

// ---------- Detail ----------

export function useApplicant(id: string) {
  return useQuery({
    queryKey: queryKeys.applicants.detail(id),
    queryFn: () => applicantService.getById(id),
    enabled: Boolean(id),
  });
}

// ---------- Mutations ----------

export function useCreateApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicantService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() });
    },
  });
}

export function useUpdateApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof applicantService.update>[1];
    }) => applicantService.update(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.applicants.detail(id) });
    },
  });
}

export function useArchiveApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicantService.archive(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.applicants.detail(id) });
    },
  });
}
