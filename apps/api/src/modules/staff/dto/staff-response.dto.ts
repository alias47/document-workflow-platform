import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty() id: string = '';
  @ApiProperty() name: string = '';
  @ApiPropertyOptional() description: string | null = null;
}

export class StaffResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() organizationId: string = '';
  @ApiProperty() firstName: string = '';
  @ApiProperty() lastName: string = '';
  @ApiProperty() email: string = '';
  @ApiPropertyOptional() phone: string | null = null;
  @ApiPropertyOptional() jobTitle: string | null = null;
  @ApiPropertyOptional() avatarUrl: string | null = null;
  @ApiProperty() status: string = '';
  @ApiProperty() isActive: boolean = true;
  @ApiPropertyOptional() role: RoleDto | null = null;
  @ApiPropertyOptional() assignedApplicantCount: number = 0;
  @ApiPropertyOptional() lastLoginAt: Date | null = null;
  @ApiProperty() createdAt: Date = new Date();
  @ApiProperty() updatedAt: Date = new Date();
}
