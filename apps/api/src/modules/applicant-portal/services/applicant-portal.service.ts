import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { UpdateApplicantProfileDto } from '../dto/update-applicant-profile.dto';
import type { UploadDocumentDto } from '@/modules/document/dto/upload-document.dto';

import { ApplicantRepository } from '@/modules/applicant/repositories/applicant.repository';
import { DocumentRepository } from '@/modules/document/repositories/document.repository';
import { DocumentUploadService } from '@/modules/document/services/document-upload.service';
import { DocumentRequirementRepository } from '@/modules/document-requirement/repositories/document-requirement.repository';
import { OrganizationRepository } from '@/modules/organization/repositories/organization.repository';

@Injectable()
export class ApplicantPortalService {
  constructor(
    private readonly applicantRepo: ApplicantRepository,
    private readonly requirementRepo: DocumentRequirementRepository,
    private readonly uploadService: DocumentUploadService,
    private readonly documentRepo: DocumentRepository,
    private readonly organizationRepo: OrganizationRepository,
  ) {}

  async getDashboard(applicantId: string, organizationId: string) {
    const applicant = await this.applicantRepo.findById(applicantId, organizationId);
    if (!applicant) throw new NotFoundException('Applicant not found');

    const requirements = await this.requirementRepo.listApplicantRequirements(
      applicantId,
      organizationId,
    );

    const primaryAssignment = applicant.assignments.find((a) => a.isPrimary);

    const counts = {
      required: requirements.length,
      uploaded: requirements.filter((r) => r.status === 'uploaded').length,
      approved: requirements.filter((r) => r.status === 'approved').length,
      rejected: requirements.filter((r) => r.status === 'rejected').length,
      pending: requirements.filter((r) => r.status === 'pending').length,
    };

    return {
      applicant: {
        id: applicant.id,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        applicantNumber: applicant.applicantNumber,
        email: applicant.email,
      },
      assignedConsultant: primaryAssignment
        ? {
            id: primaryAssignment.staff.id,
            firstName: primaryAssignment.staff.firstName,
            lastName: primaryAssignment.staff.lastName,
          }
        : null,
      documentCounts: counts,
      recentRequirements: requirements.slice(0, 5),
    };
  }

  async getProfile(applicantId: string, organizationId: string) {
    const [applicant, org] = await Promise.all([
      this.applicantRepo.findById(applicantId, organizationId),
      this.organizationRepo.findById(organizationId),
    ]);
    if (!applicant) throw new NotFoundException('Applicant not found');

    const primaryAssignment = applicant.assignments.find((a) => a.isPrimary);

    return {
      id: applicant.id,
      firstName: applicant.firstName,
      middleName: applicant.middleName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      address: applicant.address,
      city: applicant.city,
      country: applicant.country,
      gender: applicant.gender,
      dateOfBirth: applicant.dateOfBirth,
      nationality: applicant.nationality,
      applicantNumber: applicant.applicantNumber,
      status: applicant.status,
      portalAllowProfileEdit: org?.portalAllowProfileEdit ?? true,
      assignedConsultant: primaryAssignment
        ? {
            id: primaryAssignment.staff.id,
            firstName: primaryAssignment.staff.firstName,
            lastName: primaryAssignment.staff.lastName,
          }
        : null,
    };
  }

  async updateProfile(applicantId: string, organizationId: string, dto: UpdateApplicantProfileDto) {
    const org = await this.organizationRepo.findById(organizationId);
    if (!org?.portalAllowProfileEdit) {
      throw new ForbiddenException('Profile editing is disabled by your organization');
    }

    const applicant = await this.applicantRepo.findById(applicantId, organizationId);
    if (!applicant) throw new NotFoundException('Applicant not found');

    return this.applicantRepo.update(applicantId, {
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.city !== undefined ? { city: dto.city } : {}),
      ...(dto.country !== undefined ? { country: dto.country } : {}),
    });
  }

  async getDocumentRequirements(applicantId: string, organizationId: string) {
    const applicant = await this.applicantRepo.findById(applicantId, organizationId);
    if (!applicant) throw new NotFoundException('Applicant not found');
    return this.requirementRepo.listApplicantRequirements(applicantId, organizationId);
  }

  async uploadDocument(
    file: Express.Multer.File,
    applicantId: string,
    organizationId: string,
    requirementId: string,
  ) {
    // Verify the requirement belongs to this applicant and org.
    const applicantReq = await this.requirementRepo.findApplicantRequirement(requirementId);
    if (!applicantReq || applicantReq.applicantId !== applicantId) {
      throw new ForbiddenException('Document requirement not found or does not belong to you');
    }

    if (!applicantReq.requirement) {
      throw new NotFoundException('Requirement definition not found');
    }

    if (applicantReq.requirement.deletedAt) {
      throw new BadRequestException('Cannot upload to an archived requirement');
    }

    if (applicantReq.status === 'approved') {
      throw new BadRequestException('Cannot upload to an approved requirement');
    }

    const dto: UploadDocumentDto = {
      applicantId,
      category: applicantReq.requirement.category,
      requirementId,
    };

    return this.uploadService.upload(file, dto, organizationId, {
      type: 'applicant',
      applicantId,
    });
  }

  async listDocuments(applicantId: string, organizationId: string, page = 1, pageSize = 25) {
    const applicant = await this.applicantRepo.findById(applicantId, organizationId);
    if (!applicant) throw new NotFoundException('Applicant not found');

    const { data, total } = await this.documentRepo.listForApplicantPortal(
      applicantId,
      organizationId,
      { page, pageSize },
    );

    return {
      data,
      meta: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async downloadDocument(documentId: string, applicantId: string, organizationId: string) {
    // Ownership check: document must belong to this applicant and org.
    const doc = await this.documentRepo.findById(documentId, organizationId);
    if (!doc || doc.applicantId !== applicantId) {
      throw new ForbiddenException('Document not found or does not belong to you');
    }
    return this.uploadService.download(documentId, organizationId);
  }
}
