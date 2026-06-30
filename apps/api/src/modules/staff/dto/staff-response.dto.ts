import { ApiProperty } from '@nestjs/swagger';

export class StaffResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() organizationId: string = '';
  @ApiProperty() firstName: string = '';
  @ApiProperty() lastName: string = '';
  @ApiProperty() email: string = '';
  @ApiProperty() phone: string | null = null;
  @ApiProperty() jobTitle: string | null = null;
  @ApiProperty() status: string = '';
  @ApiProperty() lastLoginAt: Date | null = null;
  @ApiProperty() createdAt: Date = new Date();
}
