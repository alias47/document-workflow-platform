import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignedStaffDto {
  @ApiProperty() id: string = '';
  @ApiProperty() firstName: string = '';
  @ApiProperty() lastName: string = '';
  @ApiProperty() isPrimary: boolean = false;
}

export class ApplicantListItemDto {
  @ApiProperty() id: string = '';
  @ApiProperty() applicantNumber: string = '';
  @ApiProperty() firstName: string = '';
  @ApiPropertyOptional() middleName: string | null = null;
  @ApiProperty() lastName: string = '';
  @ApiPropertyOptional() email: string | null = null;
  @ApiPropertyOptional() phone: string | null = null;
  @ApiProperty() status: string = '';
  @ApiProperty() createdAt: Date = new Date();
  @ApiProperty({ type: [AssignedStaffDto] }) assignments: AssignedStaffDto[] = [];
}

export class ApplicantDetailDto extends ApplicantListItemDto {
  @ApiPropertyOptional() gender: string | null = null;
  @ApiPropertyOptional() dateOfBirth: Date | null = null;
  @ApiPropertyOptional() nationality: string | null = null;
  @ApiPropertyOptional() address: string | null = null;
  @ApiPropertyOptional() city: string | null = null;
  @ApiPropertyOptional() country: string | null = null;
  @ApiPropertyOptional() updatedAt: Date = new Date();
}

export class ApplicantCreatedDto {
  @ApiProperty() id: string = '';
  @ApiProperty() applicantNumber: string = '';
}
