import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;
const PASSWORD_MESSAGE =
  'Password must be at least 12 characters and contain uppercase, lowercase, digit, and special character';

export class ApplicantChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  currentPassword: string = '';

  @ApiProperty({ minLength: 12, description: PASSWORD_MESSAGE })
  @IsString()
  @MinLength(12)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  newPassword: string = '';
}
