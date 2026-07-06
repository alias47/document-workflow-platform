import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() name: string = '';
  @ApiPropertyOptional() legalName: string | null = null;
  @ApiProperty() slug: string = '';
  @ApiProperty() contactEmail: string = '';
  @ApiPropertyOptional() contactPhone: string | null = null;
  @ApiPropertyOptional() website: string | null = null;
  @ApiPropertyOptional() address: string | null = null;
  @ApiPropertyOptional() city: string | null = null;
  @ApiPropertyOptional() country: string | null = null;
  @ApiPropertyOptional() postalCode: string | null = null;
  @ApiProperty() timezone: string = 'UTC';
  @ApiPropertyOptional() description: string | null = null;
  @ApiPropertyOptional() logoKey: string | null = null;
  @ApiPropertyOptional() shortName: string | null = null;
  @ApiPropertyOptional() primaryColor: string | null = null;
  @ApiPropertyOptional() secondaryColor: string | null = null;
  @ApiPropertyOptional() faviconKey: string | null = null;
  // Applicant portal
  @ApiProperty() portalEnabled: boolean = true;
  @ApiProperty() portalAllowProfileEdit: boolean = true;
  @ApiProperty() portalAllowPasswordChange: boolean = true;
  @ApiProperty() portalAllowDocUpload: boolean = true;
  @ApiProperty() portalShowConsultant: boolean = true;
  @ApiProperty() portalShowContactInfo: boolean = false;
  // Document upload
  @ApiProperty() uploadMaxSizeMb: number = 10;
  @ApiProperty({ type: [String] }) uploadAllowedImageTypes: string[] = [];
  @ApiProperty({ type: [String] }) uploadAllowedDocTypes: string[] = [];
  @ApiProperty() uploadMaxFilesPerReq: number = 5;
  @ApiProperty() uploadAllowMultiple: boolean = true;
  @ApiProperty() uploadAllowReplace: boolean = true;
  @ApiProperty() uploadRequireApprovalForResubmit: boolean = false;
  // Notifications
  @ApiProperty() emailEnabled: boolean = true;
  @ApiProperty() isActive: boolean = true;
  @ApiProperty() createdAt: Date = new Date();
  @ApiProperty() updatedAt: Date = new Date();
}
