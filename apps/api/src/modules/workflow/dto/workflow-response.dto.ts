import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkflowStageDto {
  @ApiProperty() id: string = '';
  @ApiProperty() name: string = '';
  @ApiPropertyOptional() description: string | null = null;
  @ApiPropertyOptional() color: string | null = null;
  @ApiPropertyOptional() icon: string | null = null;
  @ApiProperty() order: number = 0;
  @ApiProperty() isDefault: boolean = false;
  @ApiProperty() isFinal: boolean = false;
  @ApiProperty() createdAt: Date = new Date();
  @ApiProperty() updatedAt: Date = new Date();
}

export class ApplicantWorkflowDto {
  @ApiProperty() id: string = '';
  @ApiProperty() applicantId: string = '';
  @ApiProperty() currentStageId: string = '';
  @ApiProperty() enteredStageAt: Date = new Date();
  @ApiPropertyOptional() expectedCompletionDate: Date | null = null;
  @ApiPropertyOptional() notes: string | null = null;
  @ApiProperty({ type: WorkflowStageDto }) currentStage: WorkflowStageDto = new WorkflowStageDto();
}

export class WorkflowHistoryItemDto {
  @ApiProperty() id: string = '';
  @ApiProperty() applicantId: string = '';
  @ApiPropertyOptional() fromStageId: string | null = null;
  @ApiProperty() toStageId: string = '';
  @ApiPropertyOptional() changedBy: string | null = null;
  @ApiProperty() changedAt: Date = new Date();
  @ApiPropertyOptional() comment: string | null = null;
}
