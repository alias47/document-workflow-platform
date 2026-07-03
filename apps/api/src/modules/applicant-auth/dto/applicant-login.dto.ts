import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ApplicantLoginDto {
  @ApiProperty({ example: 'applicant@example.com' })
  @IsEmail()
  email: string = '';

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string = '';
}
