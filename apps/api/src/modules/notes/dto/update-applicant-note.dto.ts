import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateApplicantNoteDto {
  @ApiProperty({ example: 'Updated note content.', maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  @Transform(({ value }: { value: string }) => (typeof value === 'string' ? value.trim() : value))
  content: string = '';
}
