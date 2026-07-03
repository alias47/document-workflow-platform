'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { applicantPortalService } from '../services/applicant-portal.service';

import type { UpdateApplicantProfileData } from '../types';

import { useToast } from '@/components/ui/toast';
import { queryKeys } from '@/lib/query-keys';

export function useApplicantMe() {
  return useQuery({
    queryKey: queryKeys.applicantPortal.me(),
    queryFn: () => applicantPortalService.getMe(),
    retry: false,
  });
}

export function useApplicantDashboard() {
  return useQuery({
    queryKey: queryKeys.applicantPortal.dashboard(),
    queryFn: () => applicantPortalService.getDashboard(),
  });
}

export function useApplicantProfile() {
  return useQuery({
    queryKey: queryKeys.applicantPortal.profile(),
    queryFn: () => applicantPortalService.getProfile(),
  });
}

export function useApplicantDocumentRequirements() {
  return useQuery({
    queryKey: queryKeys.applicantPortal.documentRequirements(),
    queryFn: () => applicantPortalService.getDocumentRequirements(),
  });
}

export function useApplicantLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => applicantPortalService.login(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.applicantPortal.all });
    },
  });
}

export function useApplicantLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => applicantPortalService.logout(),
    onSuccess: () => {
      qc.clear();
    },
  });
}

export function useApplicantChangePassword() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      applicantPortalService.changePassword(data),
    onSuccess: () => {
      toast({ type: 'success', title: 'Password changed successfully' });
    },
  });
}

export function useUpdateApplicantProfile() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: UpdateApplicantProfileData) => applicantPortalService.updateProfile(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.applicantPortal.profile() });
      toast({ type: 'success', title: 'Profile updated' });
    },
  });
}

export function useApplicantUploadDocument() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ requirementId, file }: { requirementId: string; file: File }) =>
      applicantPortalService.uploadDocument(requirementId, file),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.applicantPortal.documentRequirements(),
      });
      toast({ type: 'success', title: 'Document uploaded successfully' });
    },
    onError: () => {
      toast({ type: 'error', title: 'Upload failed', message: 'Please try again' });
    },
  });
}
