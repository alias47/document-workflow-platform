import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateApplicantWorkflowDto {
  @ApiProperty({ description: 'UUID of the stage to move the applicant into' })
  @IsUUID()
  stageId: string = '';

  @ApiPropertyOptional({ description: 'Optional note recorded on the transition' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiPropertyOptional({ example: '2026-09-01', description: 'Expected completion date (ISO)' })
  @IsOptional()
  @IsDateString()
  expectedCompletionDate?: string;

  @ApiPropertyOptional({ description: 'Free-form notes stored on the applicant workflow' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
