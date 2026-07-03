# Sprint 11.1 — System Settings

## Goal

Implement a centralized System Settings module that allows the Super Admin to configure the consultancy. The application supports a single consultancy for the MVP. The existing Organization record represents the consultancy and must not be creatable or deletable through the UI.

---

# 11.1.1 Consultancy Profile

Allow the Super Admin to view and update the consultancy profile.

Fields

- Consultancy Name
- Logo
- Email
- Phone Number
- Website
- Address
- City
- Country
- Postal Code
- Time Zone
- Description

Requirements

- Load the existing consultancy automatically.
- Update profile information.
- Upload logo.
- Replace logo.
- Remove logo.
- Preview logo before upload.
- Validate image type and size.
- Save changes atomically.

---

# 11.1.2 Applicant Portal Settings

Allow the Super Admin to configure the applicant portal.

Settings

- Enable Applicant Portal
- Allow Applicant Profile Editing
- Allow Applicant Password Change
- Allow Applicant Document Upload
- Show Assigned Consultant
- Show Consultancy Contact Information

Changes should take effect immediately.

---

# 11.1.3 Document Upload Settings

Configure organization-wide upload behaviour.

Settings

- Maximum Upload Size (MB)
- Allowed Image Types
- Allowed Document Types
- Maximum Files Per Requirement
- Allow Multiple Uploads
- Allow Replace Upload
- Require Approval Before Resubmission

These settings apply to every applicant.

---

# 11.1.4 Branding

Allow customization of basic branding.

Fields

- Primary Color
- Secondary Color
- Consultancy Short Name
- Logo
- Favicon (optional)

Branding will be used throughout the staff dashboard and applicant portal.

---

# 11.1.5 Backend

Create

SystemSettingsModule

Repository

Service

Controller

DTOs

Response DTOs

Validation

Reuse the existing Organization model whenever possible.

Only extend the schema if absolutely necessary.

---

# 11.1.6 API

GET /settings

PATCH /settings

PATCH /settings/logo

DELETE /settings/logo

Only Super Admin can access these endpoints.

---

# 11.1.7 Frontend

Create

features/settings

services/settings.service.ts

hooks/use-settings.ts

Components

- ConsultancyProfileCard
- BrandingCard
- ApplicantPortalSettingsCard
- DocumentUploadSettingsCard
- LogoUploader
- SettingsSkeleton
- SettingsError
- SettingsPageClient

Create route

/settings

Remove all remaining mock settings.

---

# 11.1.8 Business Rules

Only Super Admin can modify settings.

Existing consultancy cannot be deleted.

Existing consultancy cannot be replaced.

Only one consultancy exists.

Logo stored through StorageProvider.

Replacing a logo deletes the previous file only after the new upload succeeds.

Removing a logo deletes the physical file.

Settings update must be atomic.

---

# 11.1.9 Security

Enforce RBAC.

Validate uploads.

Validate image types.

Maximum logo size: 5 MB.

Prevent directory traversal.

Audit every settings modification.

---

# 11.1.10 Tests

Repository

Service

Controller

Authorization

Validation

Storage integration

---

# 11.1.11 Quality Gates

pnpm lint

pnpm type-check

pnpm build

Backend tests

---

# 11.1.12 Sprint Completion Report

Provide:

1. Sprint Completion Report

2. Files Created

3. Files Modified

4. Database Changes

5. API Endpoints

6. Business Rules Implemented

7. Frontend Components

8. Tests Added

9. Validation Results

10. Documentation Inconsistencies

11. TASK.md Completion Confirmation

Do not commit any code.
