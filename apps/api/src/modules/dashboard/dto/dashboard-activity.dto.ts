import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivityActorDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  firstName: string = '';

  @ApiProperty()
  lastName: string = '';
}

export class ActivityTargetDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  firstName: string = '';

  @ApiProperty()
  lastName: string = '';
}

/** A single row in the dashboard recent-activity feed (Sprint 11.5 §11). */
export class DashboardActivityDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty({ example: 'document.uploaded' })
  type: string = '';

  @ApiProperty()
  title: string = '';

  @ApiPropertyOptional({ nullable: true })
  description: string | null = null;

  @ApiProperty()
  createdAt: Date = new Date();

  @ApiPropertyOptional({ nullable: true, type: ActivityActorDto })
  actor: ActivityActorDto | null = null;

  @ApiPropertyOptional({ nullable: true, type: ActivityTargetDto })
  target: ActivityTargetDto | null = null;
}
