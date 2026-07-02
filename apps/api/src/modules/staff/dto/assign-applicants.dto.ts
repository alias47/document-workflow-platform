import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignApplicantsDto {
  @ApiProperty({
    description: 'List of applicant UUIDs to assign to this staff member',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  applicantIds: string[] = [];
}
