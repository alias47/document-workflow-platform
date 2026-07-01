import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NoteAuthorDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  firstName: string = '';

  @ApiProperty()
  lastName: string = '';
}

export class ApplicantNoteResponseDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  organizationId: string = '';

  @ApiProperty()
  applicantId: string = '';

  @ApiProperty()
  authorId: string = '';

  @ApiProperty()
  content: string = '';

  @ApiProperty()
  createdAt: Date = new Date();

  @ApiProperty()
  updatedAt: Date = new Date();

  @ApiPropertyOptional({ type: NoteAuthorDto })
  author?: NoteAuthorDto;
}
