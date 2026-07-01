import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

import type { SearchEntityType } from '../interfaces/search-provider.interface';

export { SearchEntityType };

const ENTITY_VALUES: SearchEntityType[] = ['applicant', 'document', 'workflow'];

export class SearchQueryDto {
  @ApiProperty({ example: 'john', description: 'Search query string' })
  @IsString()
  @MinLength(1)
  q: string = '';

  @ApiPropertyOptional({
    enum: ENTITY_VALUES,
    description: 'Restrict results to a single entity type. Omit to search all.',
  })
  @IsOptional()
  @IsEnum(ENTITY_VALUES)
  entity?: SearchEntityType;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  pageSize?: number = 20;
}
