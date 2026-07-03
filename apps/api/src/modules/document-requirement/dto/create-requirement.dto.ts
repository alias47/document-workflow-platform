import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentCategory } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRequirementDto {
  @ApiProperty({ example: 'Passport' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string = '';

  @ApiPropertyOptional({ example: 'Valid government-issued passport' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | undefined;

  @ApiProperty({ enum: DocumentCategory, example: 'identity' })
  @IsEnum(DocumentCategory)
  category: DocumentCategory = 'other';

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean | undefined;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean | undefined;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number | undefined;
}
