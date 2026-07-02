import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivityActorDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  firstName: string = '';

  @ApiProperty()
  lastName: string = '';
}

export class ActivityResponseDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  applicantId: string = '';

  @ApiProperty({ example: 'document.uploaded' })
  type: string = '';

  @ApiProperty()
  title: string = '';

  @ApiPropertyOptional({ nullable: true })
  description: string | null = null;

  @ApiPropertyOptional({ nullable: true, type: ActivityActorDto })
  actor: ActivityActorDto | null = null;

  @ApiPropertyOptional({ nullable: true, type: Object })
  metadata: Record<string, unknown> | null = null;

  @ApiProperty()
  createdAt: Date = new Date();
}
