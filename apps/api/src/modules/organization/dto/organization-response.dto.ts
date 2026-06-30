import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() name: string = '';
  @ApiPropertyOptional() legalName: string | null = null;
  @ApiProperty() slug: string = '';
  @ApiProperty() contactEmail: string = '';
  @ApiPropertyOptional() contactPhone: string | null = null;
  @ApiPropertyOptional() website: string | null = null;
  @ApiPropertyOptional() country: string | null = null;
  @ApiProperty() timezone: string = 'UTC';
  @ApiPropertyOptional() industryType: string | null = null;
  @ApiProperty() isActive: boolean = true;
  @ApiProperty() createdAt: Date = new Date();
  @ApiProperty() updatedAt: Date = new Date();
}
