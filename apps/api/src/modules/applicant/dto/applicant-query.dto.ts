import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

const SORT_FIELDS = ['createdAt', 'lastName', 'firstName', 'applicantNumber', 'status'] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;
const STATUSES = ['active', 'inactive', 'archived'] as const;

export class ApplicantQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 25;

  @ApiPropertyOptional({ description: 'Search by name, email, or applicant number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned staff UUID' })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({ enum: SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORT_FIELDS)
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({ enum: SORT_ORDERS, default: 'desc' })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  sortOrder: string = 'desc';
}
