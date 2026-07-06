export class ValidateTokenResponseDto {
  valid!: boolean;
  reason!: string | null;
  applicantName!: string | null;
  organizationName!: string | null;
}
