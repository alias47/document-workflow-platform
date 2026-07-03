export interface SystemSettings {
  id: string;
  name: string;
  legalName: string | null;
  slug: string;
  contactEmail: string;
  contactPhone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  timezone: string;
  description: string | null;
  logoKey: string | null;
  shortName: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  faviconKey: string | null;
  // Applicant portal
  portalEnabled: boolean;
  portalAllowProfileEdit: boolean;
  portalAllowPasswordChange: boolean;
  portalAllowDocUpload: boolean;
  portalShowConsultant: boolean;
  portalShowContactInfo: boolean;
  // Document upload
  uploadMaxSizeMb: number;
  uploadAllowedImageTypes: string[];
  uploadAllowedDocTypes: string[];
  uploadMaxFilesPerReq: number;
  uploadAllowMultiple: boolean;
  uploadAllowReplace: boolean;
  uploadRequireApprovalForResubmit: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData {
  name?: string;
  legalName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  description?: string;
  shortName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  portalEnabled?: boolean;
  portalAllowProfileEdit?: boolean;
  portalAllowPasswordChange?: boolean;
  portalAllowDocUpload?: boolean;
  portalShowConsultant?: boolean;
  portalShowContactInfo?: boolean;
  uploadMaxSizeMb?: number;
  uploadAllowedImageTypes?: string[];
  uploadAllowedDocTypes?: string[];
  uploadMaxFilesPerReq?: number;
  uploadAllowMultiple?: boolean;
  uploadAllowReplace?: boolean;
  uploadRequireApprovalForResubmit?: boolean;
}
