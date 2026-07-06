import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export enum NotificationStatusFilter {
  queued = 'queued',
  processing = 'processing',
  sent = 'sent',
  failed = 'failed',
}

export class NotificationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ enum: NotificationStatusFilter })
  @IsOptional()
  @IsEnum(NotificationStatusFilter)
  status?: NotificationStatusFilter;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  template?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
