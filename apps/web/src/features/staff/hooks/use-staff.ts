'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { staffService } from '../services/staff.service';

import type {
  AssignApplicantsData,
  CreateStaffData,
  StaffListParams,
  UpdateStaffData,
  UpdateStaffStatusData,
} from '../types/staff.types';

import { queryKeys } from '@/lib/query-keys';

// ---------- List ----------

export function useStaffList(params: StaffListParams = {}) {
  return useQuery({
    queryKey: queryKeys.staff.list(params as Record<string, unknown>),
    queryFn: () => staffService.list(params),
  });
}

// ---------- Detail ----------

export function useStaff(id: string) {
  return useQuery({
    queryKey: queryKeys.staff.detail(id),
    queryFn: () => staffService.getById(id),
    enabled: Boolean(id),
  });
}

// ---------- Roles ----------

export function useStaffRoles() {
  return useQuery({
    queryKey: queryKeys.staff.roles(),
    queryFn: () => staffService.listRoles(),
  });
}

// ---------- Applicants for staff ----------

export function useStaffApplicants(staffId: string, page = 1, pageSize = 25) {
  return useQuery({
    queryKey: [...queryKeys.staff.applicants(staffId), { page, pageSize }] as const,
    queryFn: () => staffService.listApplicants(staffId, page, pageSize),
    enabled: Boolean(staffId),
  });
}

// ---------- Mutations ----------

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffData) => staffService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.lists() });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffData }) =>
      staffService.update(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.detail(id) });
    },
  });
}

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffStatusData }) =>
      staffService.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.detail(id) });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.lists() });
    },
  });
}

export function useAssignApplicants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignApplicantsData }) =>
      staffService.assignApplicants(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.applicants(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.detail(id) });
    },
  });
}
