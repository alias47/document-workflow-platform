import { ApiProperty } from '@nestjs/swagger';
import { RequirementStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateRequirementStatusDto {
  @ApiProperty({ enum: RequirementStatus })
  @IsEnum(RequirementStatus)
  status: RequirementStatus = 'pending';
}
