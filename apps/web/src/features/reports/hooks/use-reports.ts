'use client';

import { useQuery } from '@tanstack/react-query';

import type { ReportFilters } from '../types';

import { queryKeys } from '@/lib/query-keys';
import { reportService } from '@/services/report.service';

export function useApplicantReport(filters: ReportFilters) {
  return useQuery({
    queryKey: queryKeys.reports.applicants(filters),
    queryFn: () => reportService.getApplicantReport(filters),
  });
}

export function useDocumentReport(filters: ReportFilters) {
  return useQuery({
    queryKey: queryKeys.reports.documents(filters),
    queryFn: () => reportService.getDocumentReport(filters),
  });
}

export function useWorkflowReport() {
  return useQuery({
    queryKey: queryKeys.reports.workflow(),
    queryFn: () => reportService.getWorkflowReport(),
  });
}

export function useStaffWorkloadReport(filters: ReportFilters) {
  return useQuery({
    queryKey: queryKeys.reports.staffWorkload(filters),
    queryFn: () => reportService.getStaffWorkloadReport(filters),
  });
}
