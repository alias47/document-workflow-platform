import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

const CATEGORIES = [
  'identity',
  'academic',
  'financial',
  'language',
  'reference',
  'visa',
  'other',
] as const;

/**
 * Multipart form fields accompanying the binary in POST /documents/upload.
 * The file itself is handled by the FileInterceptor, not this DTO.
 */
export class UploadDocumentDto {
  @ApiProperty({ description: 'UUID of the applicant the document belongs to' })
  @IsUUID()
  applicantId: string = '';

  @ApiProperty({ enum: CATEGORIES, example: 'identity' })
  @IsIn(CATEGORIES)
  category: string = 'other';

  @ApiPropertyOptional({ example: '2027-01-01', description: 'Document expiry date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'File to upload' })
  file?: unknown;
}
