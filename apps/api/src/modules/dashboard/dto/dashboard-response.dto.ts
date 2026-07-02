import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty()
  totalApplicants: number = 0;

  @ApiProperty()
  activeApplicants: number = 0;

  @ApiProperty()
  archivedApplicants: number = 0;

  @ApiProperty()
  totalDocuments: number = 0;

  @ApiProperty()
  pendingDocuments: number = 0;

  @ApiProperty()
  verifiedDocuments: number = 0;

  @ApiProperty()
  rejectedDocuments: number = 0;
}

export class ApplicantSummaryDto {
  @ApiProperty()
  active: number = 0;

  @ApiProperty()
  archived: number = 0;
}

export class DocumentSummaryDto {
  @ApiProperty()
  pending: number = 0;

  @ApiProperty()
  verified: number = 0;

  @ApiProperty()
  rejected: number = 0;

  @ApiProperty()
  expired: number = 0;
}

export class RecentApplicantDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  applicantNumber: string = '';

  @ApiProperty()
  firstName: string = '';

  @ApiPropertyOptional({ nullable: true })
  lastName: string = '';

  @ApiPropertyOptional({ nullable: true })
  email: string | null = null;

  @ApiProperty({ example: 'active' })
  status: string = '';

  @ApiProperty()
  createdAt: Date = new Date();
}

export class RecentActivityActorDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  firstName: string = '';

  @ApiProperty()
  lastName: string = '';
}

export class RecentActivityDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  applicantId: string = '';

  @ApiProperty({ example: 'document.uploaded' })
  type: string = '';

  @ApiProperty()
  title: string = '';

  @ApiPropertyOptional({ nullable: true })
  description: string | null = null;

  @ApiPropertyOptional({ nullable: true, type: RecentActivityActorDto })
  actor: RecentActivityActorDto | null = null;

  @ApiProperty()
  createdAt: Date = new Date();
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardSummaryDto })
  summary: DashboardSummaryDto = new DashboardSummaryDto();

  @ApiProperty({ type: [RecentApplicantDto] })
  recentApplicants: RecentApplicantDto[] = [];

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivities: RecentActivityDto[] = [];

  @ApiProperty({ type: ApplicantSummaryDto })
  applicantSummary: ApplicantSummaryDto = new ApplicantSummaryDto();

  @ApiProperty({ type: DocumentSummaryDto })
  documentSummary: DocumentSummaryDto = new DocumentSummaryDto();
}
