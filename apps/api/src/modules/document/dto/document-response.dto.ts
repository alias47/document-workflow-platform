import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentUploaderDto {
  @ApiProperty() id: string = '';
  @ApiProperty() firstName: string = '';
  @ApiProperty() lastName: string = '';
}

export class DocumentListItemDto {
  @ApiProperty() id: string = '';
  @ApiProperty() applicantId: string = '';
  @ApiProperty() category: string = '';
  @ApiProperty() status: string = '';
  @ApiProperty() originalFilename: string = '';
  @ApiProperty() mimeType: string = '';
  @ApiProperty() fileSize: number = 0;
  @ApiPropertyOptional() expiresAt: Date | null = null;
  @ApiProperty() createdAt: Date = new Date();
  @ApiPropertyOptional({ type: DocumentUploaderDto })
  uploadedByStaff: DocumentUploaderDto | null = null;
}

export class DocumentDetailDto extends DocumentListItemDto {
  @ApiProperty() storedFilename: string = '';
  @ApiProperty() storageKey: string = '';
  @ApiPropertyOptional() checksum: string | null = null;
  @ApiPropertyOptional() verifiedAt: Date | null = null;
  @ApiPropertyOptional() verifiedBy: string | null = null;
  @ApiPropertyOptional() verificationNotes: string | null = null;
  @ApiProperty() updatedAt: Date = new Date();
}

export class DocumentCreatedDto {
  @ApiProperty() id: string = '';
}
