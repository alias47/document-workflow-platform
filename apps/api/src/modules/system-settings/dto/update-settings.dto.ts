import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateSettingsDto {
  // Consultancy profile
  @ApiPropertyOptional({ example: 'Acme Consultancy' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ example: 'admin@example.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(200)
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  // Branding
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shortName?: string;

  @ApiPropertyOptional({ example: '#2563EB' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#64748B' })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  // Applicant portal settings
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  portalEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  portalAllowProfileEdit?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  portalAllowPasswordChange?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  portalAllowDocUpload?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  portalShowConsultant?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  portalShowContactInfo?: boolean;

  // Document upload settings
  @ApiPropertyOptional({ minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  uploadMaxSizeMb?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  uploadAllowedImageTypes?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  uploadAllowedDocTypes?: string[];

  @ApiPropertyOptional({ minimum: 1, maximum: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  uploadMaxFilesPerReq?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  uploadAllowMultiple?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  uploadAllowReplace?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  uploadRequireApprovalForResubmit?: boolean;

  // Notifications
  @ApiPropertyOptional({ description: 'Master switch for all outgoing email' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;
}
