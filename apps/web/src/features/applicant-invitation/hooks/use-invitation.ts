'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { invitationService } from '@/services/invitation.service';

export function useInvitation(applicantId: string) {
  return useQuery({
    queryKey: queryKeys.invitation.byApplicant(applicantId),
    queryFn: () => invitationService.getInvitation(applicantId),
    enabled: Boolean(applicantId),
  });
}

export function useSendInvitation(applicantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invitationService.sendInvitation(applicantId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.invitation.byApplicant(applicantId),
      });
    },
  });
}

export function useResendInvitation(applicantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invitationService.resendInvitation(applicantId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.invitation.byApplicant(applicantId),
      });
    },
  });
}

export function useRevokeInvitation(applicantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invitationService.revokeInvitation(applicantId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.invitation.byApplicant(applicantId),
      });
    },
  });
}
