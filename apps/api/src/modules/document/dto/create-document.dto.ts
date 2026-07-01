import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const CATEGORIES = [
  'identity',
  'academic',
  'financial',
  'language',
  'reference',
  'visa',
  'other',
] as const;

export class CreateDocumentDto {
  @ApiProperty({ description: 'UUID of the applicant the document belongs to' })
  @IsUUID()
  applicantId: string = '';

  @ApiProperty({ enum: CATEGORIES, example: 'identity' })
  @IsIn(CATEGORIES)
  category: string = 'other';

  @ApiProperty({ example: 'passport.pdf' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  originalFilename: string = '';

  @ApiProperty({ example: 'a1b2c3-passport.pdf' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  storedFilename: string = '';

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @MaxLength(255)
  mimeType: string = '';

  @ApiProperty({ example: 204800, description: 'File size in bytes' })
  @IsInt()
  @Min(0)
  fileSize: number = 0;

  @ApiProperty({ example: 'org/applicant/passport.pdf', description: 'Provider storage key' })
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  storageKey: string = '';

  @ApiPropertyOptional({ example: 'sha256:...', description: 'File checksum for integrity' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  checksum?: string;

  @ApiPropertyOptional({ example: '2027-01-01', description: 'Document expiry date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
