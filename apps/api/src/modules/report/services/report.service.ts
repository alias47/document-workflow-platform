import { Injectable } from '@nestjs/common';

import {
  ReportRepository,
  type ApplicantReportFilters,
  type DocumentReportFilters,
  type StaffWorkloadFilters,
} from '../repositories/report.repository';

import type { ExportResult } from '@/modules/export/interfaces/export-provider.interface';

import { AuditService } from '@/modules/audit/services/audit.service';
import { ExportService } from '@/modules/export/services/export.service';

export interface ApplicantReportRow {
  name: string;
  email: string;
  phone: string;
  consultant: string;
  workflowStage: string;
  status: string;
  country: string;
  createdAt: string;
}

export interface DocumentReportRow {
  applicant: string;
  email: string;
  totalRequirements: number;
  uploaded: number;
  approved: number;
  rejected: number;
  pending: number;
  completionPercent: string;
}

export interface WorkflowReportRow {
  stageName: string;
  applicantCount: number;
}

export interface StaffWorkloadRow {
  name: string;
  role: string;
  activeApplicants: number;
  completedApplicants: number;
}

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly exportService: ExportService,
    private readonly auditService: AuditService,
  ) {}

  async getApplicantReport(organizationId: string, filters: ApplicantReportFilters) {
    const { data, total } = await this.reportRepo.getApplicantReport(organizationId, filters);
    const rows = data.map((a) => this.mapApplicantRow(a));
    const totalPages = Math.ceil(total / filters.pageSize);

    return {
      data: rows,
      meta: { page: filters.page, pageSize: filters.pageSize, totalItems: total, totalPages },
    };
  }

  async exportApplicantReport(
    organizationId: string,
    filters: Omit<ApplicantReportFilters, 'page' | 'pageSize'>,
    format: 'csv' | 'xlsx' | 'pdf',
    actorId: string,
  ): Promise<ExportResult> {
    this.exportService.validateFormat(format);

    const { data } = await this.reportRepo.getApplicantReportAll(organizationId, filters);
    const rows = data.map((a) => this.mapApplicantRow(a));

    await this.auditService.log({
      organizationId,
      actorId,
      actorType: 'staff',
      action: 'report.export.applicants',
      resourceType: 'report',
      metadata: { format, rowCount: rows.length },
    });

    return this.exportService.generate(format, {
      title: 'Applicant Report',
      columns: [
        { header: 'Name', key: 'name', width: 24 },
        { header: 'Email', key: 'email', width: 28 },
        { header: 'Phone', key: 'phone', width: 16 },
        { header: 'Consultant', key: 'consultant', width: 22 },
        { header: 'Workflow Stage', key: 'workflowStage', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Country', key: 'country', width: 16 },
        { header: 'Created', key: 'createdAt', width: 16 },
      ],
      rows,
    });
  }

  async getDocumentReport(organizationId: string, filters: DocumentReportFilters) {
    const { data, total } = await this.reportRepo.getDocumentReport(organizationId, filters);
    const rows = data.map((a) => this.mapDocumentRow(a));
    const totalPages = Math.ceil(total / filters.pageSize);

    return {
      data: rows,
      meta: { page: filters.page, pageSize: filters.pageSize, totalItems: total, totalPages },
    };
  }

  async exportDocumentReport(
    organizationId: string,
    filters: Omit<DocumentReportFilters, 'page' | 'pageSize'>,
    format: 'csv' | 'xlsx' | 'pdf',
    actorId: string,
  ): Promise<ExportResult> {
    this.exportService.validateFormat(format);

    const { data } = await this.reportRepo.getDocumentReportAll(organizationId, filters);
    const rows = data.map((a) => this.mapDocumentRow(a));

    await this.auditService.log({
      organizationId,
      actorId,
      actorType: 'staff',
      action: 'report.export.documents',
      resourceType: 'report',
      metadata: { format, rowCount: rows.length },
    });

    return this.exportService.generate(format, {
      title: 'Document Report',
      columns: [
        { header: 'Applicant', key: 'applicant', width: 24 },
        { header: 'Email', key: 'email', width: 28 },
        { header: 'Total', key: 'totalRequirements', width: 10 },
        { header: 'Uploaded', key: 'uploaded', width: 12 },
        { header: 'Approved', key: 'approved', width: 12 },
        { header: 'Rejected', key: 'rejected', width: 12 },
        { header: 'Pending', key: 'pending', width: 12 },
        { header: 'Completion %', key: 'completionPercent', width: 14 },
      ],
      rows,
    });
  }

  async getWorkflowReport(organizationId: string) {
    const data = await this.reportRepo.getWorkflowReport(organizationId);
    return { data };
  }

  async exportWorkflowReport(
    organizationId: string,
    format: 'csv' | 'xlsx' | 'pdf',
    actorId: string,
  ): Promise<ExportResult> {
    this.exportService.validateFormat(format);

    const data = await this.reportRepo.getWorkflowReport(organizationId);

    await this.auditService.log({
      organizationId,
      actorId,
      actorType: 'staff',
      action: 'report.export.workflow',
      resourceType: 'report',
      metadata: { format, rowCount: data.length },
    });

    return this.exportService.generate(format, {
      title: 'Workflow Report',
      columns: [
        { header: 'Stage', key: 'stageName', width: 28 },
        { header: 'Applicant Count', key: 'applicantCount', width: 18 },
      ],
      rows: data,
    });
  }

  async getStaffWorkloadReport(organizationId: string, filters: StaffWorkloadFilters) {
    const { data, total } = await this.reportRepo.getStaffWorkloadReport(organizationId, filters);
    const rows = data.map((s) => this.mapStaffWorkloadRow(s));
    const totalPages = Math.ceil(total / filters.pageSize);

    return {
      data: rows,
      meta: { page: filters.page, pageSize: filters.pageSize, totalItems: total, totalPages },
    };
  }

  async exportStaffWorkloadReport(
    organizationId: string,
    filters: Omit<StaffWorkloadFilters, 'page' | 'pageSize'>,
    format: 'csv' | 'xlsx' | 'pdf',
    actorId: string,
  ): Promise<ExportResult> {
    this.exportService.validateFormat(format);

    const { data } = await this.reportRepo.getStaffWorkloadReportAll(organizationId, filters);
    const rows = data.map((s) => this.mapStaffWorkloadRow(s));

    await this.auditService.log({
      organizationId,
      actorId,
      actorType: 'staff',
      action: 'report.export.staff_workload',
      resourceType: 'report',
      metadata: { format, rowCount: rows.length },
    });

    return this.exportService.generate(format, {
      title: 'Staff Workload Report',
      columns: [
        { header: 'Name', key: 'name', width: 24 },
        { header: 'Role', key: 'role', width: 18 },
        { header: 'Active Applicants', key: 'activeApplicants', width: 18 },
        { header: 'Completed Applicants', key: 'completedApplicants', width: 20 },
      ],
      rows,
    });
  }

  // --- mapping helpers ---

  private mapApplicantRow(a: {
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    country?: string | null;
    status: string;
    createdAt: Date;
    assignments: Array<{ staff: { firstName: string; lastName: string } }>;
    workflow?: { currentStage: { name: string } } | null;
  }): ApplicantReportRow {
    const consultant = a.assignments[0]?.staff;
    return {
      name: `${a.firstName} ${a.lastName}`,
      email: a.email ?? '',
      phone: a.phone ?? '',
      consultant: consultant ? `${consultant.firstName} ${consultant.lastName}` : '',
      workflowStage: a.workflow?.currentStage.name ?? '',
      status: a.status,
      country: a.country ?? '',
      createdAt: a.createdAt.toISOString().split('T')[0] ?? '',
    };
  }

  private mapDocumentRow(a: {
    firstName: string;
    lastName: string;
    email?: string | null;
    documentRequirements: Array<{ status: string }>;
  }): DocumentReportRow {
    const reqs = a.documentRequirements;
    const total = reqs.length;
    const uploaded = reqs.filter((r) => r.status === 'uploaded').length;
    const approved = reqs.filter((r) => r.status === 'approved').length;
    const rejected = reqs.filter((r) => r.status === 'rejected').length;
    const pending = reqs.filter((r) => r.status === 'pending').length;
    const completionPercent = total > 0 ? `${Math.round((approved / total) * 100)}%` : '0%';

    return {
      applicant: `${a.firstName} ${a.lastName}`,
      email: a.email ?? '',
      totalRequirements: total,
      uploaded,
      approved,
      rejected,
      pending,
      completionPercent,
    };
  }

  private mapStaffWorkloadRow(s: {
    firstName: string;
    lastName: string;
    role: { name: string };
    assignments: Array<{ applicant: { status: string } }>;
  }): StaffWorkloadRow {
    const active = s.assignments.filter((a) => a.applicant.status === 'active').length;
    const completed = s.assignments.filter((a) => a.applicant.status === 'archived').length;

    return {
      name: `${s.firstName} ${s.lastName}`,
      role: s.role.name,
      activeApplicants: active,
      completedApplicants: completed,
    };
  }
}
