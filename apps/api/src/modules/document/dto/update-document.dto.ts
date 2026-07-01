import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const CATEGORIES = [
  'identity',
  'academic',
  'financial',
  'language',
  'reference',
  'visa',
  'other',
] as const;

// Verification status transitions are staff-driven; `pending`/`expired` are set by
// the system, so they are intentionally excluded from the manual-update surface.
const UPDATABLE_STATUSES = ['verified', 'rejected'] as const;

export class UpdateDocumentDto {
  @ApiPropertyOptional({ enum: CATEGORIES })
  @IsOptional()
  @IsIn(CATEGORIES)
  category?: string;

  @ApiPropertyOptional({ enum: UPDATABLE_STATUSES, description: 'Verification decision' })
  @IsOptional()
  @IsIn(UPDATABLE_STATUSES)
  status?: string;

  @ApiPropertyOptional({ example: '2027-01-01', description: 'Document expiry date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Notes explaining the verification decision' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  verificationNotes?: string;
}
