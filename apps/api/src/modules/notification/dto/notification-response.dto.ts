import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() organizationId: string = '';
  @ApiProperty() channel: string = 'email';
  @ApiProperty({ enum: ['queued', 'processing', 'sent', 'failed'] })
  status: string = 'queued';
  @ApiProperty() template: string = '';
  @ApiProperty() recipient: string = '';
  @ApiProperty() subject: string = '';
  @ApiProperty() body: string = '';
  @ApiPropertyOptional() metadata: Record<string, unknown> | null = null;
  @ApiProperty() retryCount: number = 0;
  @ApiProperty() maxRetries: number = 5;
  @ApiPropertyOptional() errorMessage: string | null = null;
  @ApiPropertyOptional() processedAt: Date | null = null;
  @ApiPropertyOptional() sentAt: Date | null = null;
  @ApiProperty() createdAt: Date = new Date();
  @ApiProperty() updatedAt: Date = new Date();
}
