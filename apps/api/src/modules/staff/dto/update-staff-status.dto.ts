import { ApiProperty } from '@nestjs/swagger';
import { StaffStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateStaffStatusDto {
  @ApiProperty({ enum: StaffStatus, example: 'active' })
  @IsEnum(StaffStatus)
  status: StaffStatus = 'active';
}
