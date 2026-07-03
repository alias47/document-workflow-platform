'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  type CreateRequirementData,
  type RequirementListParams,
  type RequirementStatus,
  type UpdateRequirementData,
  documentRequirementService,
} from '@/services/document-requirement.service';

export function useDocumentRequirements(params: RequirementListParams = {}) {
  return useQuery({
    queryKey: queryKeys.documentRequirements.list(params as Record<string, unknown>),
    queryFn: () => documentRequirementService.list(params),
  });
}

export function useApplicantDocumentRequirements(applicantId: string) {
  return useQuery({
    queryKey: queryKeys.documentRequirements.forApplicant(applicantId),
    queryFn: () => documentRequirementService.listForApplicant(applicantId),
    enabled: Boolean(applicantId),
  });
}

export function useCreateRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequirementData) => documentRequirementService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documentRequirements.lists() });
    },
  });
}

export function useUpdateRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRequirementData }) =>
      documentRequirementService.update(id, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documentRequirements.lists() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentRequirements.detail(variables.id),
      });
    },
  });
}

export function useArchiveRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentRequirementService.archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documentRequirements.lists() });
    },
  });
}

export function useSyncApplicantRequirements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicantId: string) => documentRequirementService.syncForApplicant(applicantId),
    onSuccess: (_, applicantId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentRequirements.forApplicant(applicantId),
      });
    },
  });
}

export function useUpdateApplicantRequirementStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequirementStatus; applicantId: string }) =>
      documentRequirementService.updateApplicantRequirementStatus(id, status),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documentRequirements.forApplicant(variables.applicantId),
      });
    },
  });
}
