# 06_API_SPECIFICATION.md

# API Specification

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the REST API specification for the Document Workflow Platform.

The API serves as the communication layer between the frontend applications and the backend services.

It establishes:

- API design standards
- Resource endpoints
- Request and response formats
- Authentication
- Authorization
- Error handling
- Versioning
- Pagination
- File upload standards

This document acts as the implementation blueprint for the NestJS backend and the contract for all frontend clients.

---

# 2. API Design Principles

The API follows RESTful design principles while remaining practical for frontend development.

Every endpoint should be:

- Predictable
- Consistent
- Stateless
- Versioned
- Secure
- Well documented
- Backward compatible whenever possible

Business logic belongs in the backend.

Frontend applications should only consume resources exposed by the API.

---

# 3. API Architecture

The platform exposes a REST API over HTTPS.

```text
Next.js Frontend
        │
        │ HTTPS
        ▼
NestJS REST API
        │
        ▼
PostgreSQL
```

Future clients:

- Mobile Application
- Admin Portal
- Third-party Integrations

All clients communicate through the same API.

---

# 4. Base URL

Development

```
http://localhost:3001/api/v1
```

Pilot

```
https://api.company.com/api/v1
```

Production

```
https://api.platform.com/api/v1
```

All endpoints are prefixed with:

```
/api/v1
```

This enables future API versioning without breaking existing clients.

---

# 5. HTTP Methods

The API uses standard HTTP methods.

| Method | Purpose                 |
| ------ | ----------------------- |
| GET    | Retrieve resources      |
| POST   | Create resources        |
| PUT    | Replace resources       |
| PATCH  | Partial update          |
| DELETE | Archive/Delete resource |

DELETE performs a soft delete unless explicitly documented otherwise.

---

# 6. Resource Naming

Resources use plural nouns.

Examples

```
/applicants

/documents

/workflows

/tasks

/notifications
```

Avoid verbs in URLs.

Good

```
POST /documents
```

Bad

```
POST /uploadDocument
```

Actions should be represented as sub-resources when necessary.

Example

```
POST /documents/{id}/approve

POST /documents/{id}/reject
```

---

# 7. Authentication

Authentication uses JWT.

Two tokens are issued.

## Access Token

Short-lived.

Default lifetime:

15 minutes

Used for every authenticated request.

---

## Refresh Token

Long-lived.

Default lifetime:

30 days

Used to obtain new Access Tokens.

Refresh Tokens are securely stored and rotated after use.

---

# Authentication Flow

Staff Login

↓

Access Token

-

Refresh Token

↓

Authenticated Requests

↓

Refresh when Access Token expires

---

Applicant authentication follows the same flow.

Applicants cannot register themselves.

Applicant accounts are created only by Staff.

# 8. Authorization

The platform uses Role-Based Access Control (RBAC).

Every authenticated user belongs to a Role.

Each Role contains one or more Permissions.

Permissions determine which API endpoints a user may access.

---

## Authorization Flow

```text
User Login
      │
      ▼
JWT Token
      │
      ▼
Authentication Guard
      │
      ▼
Role Guard
      │
      ▼
Permission Guard
      │
      ▼
Controller
```

---

## Example Permissions

Applicants

- applicant.create
- applicant.view
- applicant.update
- applicant.archive

Documents

- document.upload
- document.review
- document.approve
- document.reject
- document.delete

Workflow

- workflow.view
- workflow.update

Tasks

- task.create
- task.update
- task.complete

Settings

- settings.manage

Reports

- reports.export

---

## Authorization Rules

Staff APIs require authentication.

Applicant APIs require authentication.

Every endpoint declares its required permission.

Unauthorized requests return:

```
403 Forbidden
```

---

# 9. Request Standards

Every request must use JSON unless uploading files.

Example

```http
Content-Type: application/json
```

File uploads use:

```http
multipart/form-data
```

---

## Headers

Authenticated requests are identified by the `access_token` HttpOnly cookie set on login/refresh.
No `Authorization` header is required or accepted — tokens are never exposed to JavaScript.

```http
Cookie: access_token=<jwt>
```

Optional

```http
Accept-Language

X-Request-ID
```

The backend should generate a Request ID if one is not provided.

---

# 10. Response Standards

Every successful response follows the same structure.

## Success Response

```json
{
  "success": true,
  "message": "Applicant created successfully.",
  "data": {},
  "meta": {}
}
```

---

## Collection Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 250,
    "totalPages": 13
  }
}
```

---

## Empty Response

```json
{
  "success": true,
  "message": "No records found.",
  "data": []
}
```

---

## Delete Response

```json
{
  "success": true,
  "message": "Applicant archived successfully."
}
```

---

# 11. Error Standards

Errors follow one consistent format.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": [
      {
        "field": "email",
        "message": "Email is required."
      }
    ]
  }
}
```

---

## Common Error Codes

| HTTP | Code                    |
| ---- | ----------------------- |
| 400  | VALIDATION_ERROR        |
| 401  | UNAUTHORIZED            |
| 403  | FORBIDDEN               |
| 404  | NOT_FOUND               |
| 409  | CONFLICT                |
| 413  | FILE_TOO_LARGE          |
| 415  | UNSUPPORTED_MEDIA_TYPE  |
| 422  | BUSINESS_RULE_VIOLATION |
| 429  | RATE_LIMIT_EXCEEDED     |
| 500  | INTERNAL_SERVER_ERROR   |

---

## Validation Errors

Validation should always return every detected error.

Never return only the first validation error.

---

# 12. Pagination

All collection endpoints support pagination.

Query Parameters

```text
?page=1

&pageSize=20
```

Default

```
page = 1

pageSize = 20
```

Maximum

```
pageSize = 100
```

---

## Example

```
GET /applicants?page=2&pageSize=25
```

Response

```json
{
  "data": [],
  "meta": {
    "page": 2,
    "pageSize": 25,
    "totalItems": 248,
    "totalPages": 10
  }
}
```

---

# 13. Filtering

Resources support filtering using query parameters.

Example

```
GET /applicants

?status=active

&assignedTo=staff-id

&workflow=in-progress
```

Multiple filters may be combined.

Unknown filters should return:

```
400 Bad Request
```

---

# 14. Sorting

Sorting uses two parameters.

```
sortBy

sortOrder
```

Example

```
GET /documents

?sortBy=createdAt

&sortOrder=desc
```

Allowed Values

Ascending

```
asc
```

Descending

```
desc
```

Invalid fields return:

```
400 Bad Request
```

---

# 15. Searching

Endpoints may support free-text searching.

Example

```
GET /applicants

?search=john
```

Search should match:

- Applicant Number
- First Name
- Last Name
- Email
- Phone

Search must always be case-insensitive.

---

# 16. Field Selection (Optional)

To reduce payload size, clients may request specific fields.

Example

```
GET /applicants

?fields=id,firstName,lastName,status
```

This feature is optional for the MVP but the API should be designed to support it in the future.

---

# API Standard Summary

Every collection endpoint should support:

- Pagination
- Filtering
- Sorting
- Searching

Every response should use the same JSON envelope.

Every error should follow the same structure.

Every authenticated endpoint should enforce RBAC authorization.

These standards apply consistently across all API resources.

# 17. Authentication API

Authentication endpoints are responsible for user authentication and session management.

The platform supports two authentication flows:

- Staff Authentication
- Applicant Authentication

Applicants are invited by Staff and cannot self-register.

---

# Staff Authentication

## Login

Authenticate a Staff member.

### Endpoint

```http
POST /auth/staff/login
```

### Authentication

Not Required

---

### Request Body

```json
{
  "email": "consultant@company.com",
  "password": "Password123!"
}
```

---

### Success Response

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900,
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Consultant"
    }
  }
}
```

---

### Errors

| Status | Description         |
| ------ | ------------------- |
| 400    | Validation Error    |
| 401    | Invalid Credentials |
| 423    | Account Locked      |

---

## Refresh Token

### Endpoint

```http
POST /auth/staff/refresh
```

Authentication

Refresh Token

---

### Request

```json
{
  "refreshToken": "..."
}
```

---

### Response

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900
  }
}
```

---

## Logout

### Endpoint

```http
POST /auth/staff/logout
```

Authentication

Required

Permission

Authenticated User

---

### Response

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

## Current User

Returns currently authenticated Staff.

### Endpoint

```http
GET /auth/staff/me
```

Authentication

Required

---

### Response

```json
{
  "success": true,
  "data": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "consultant@company.com",
    "role": "Consultant"
  }
}
```

---

# Applicant Authentication

Applicants cannot register.

Staff create Applicant Accounts.

Applicants activate their account using an invitation.

---

## Activate Account

### Endpoint

```http
POST /auth/applicant/activate
```

Authentication

Not Required

---

### Request

```json
{
  "token": "invitation-token",
  "password": "Password123!"
}
```

---

### Response

```json
{
  "success": true,
  "message": "Account activated successfully."
}
```

---

## Applicant Login

### Endpoint

```http
POST /auth/applicant/login
```

Authentication

Not Required

---

### Request

```json
{
  "email": "student@email.com",
  "password": "Password123!"
}
```

---

### Response

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900,
    "user": {
      "id": "...",
      "name": "John Doe"
    }
  }
}
```

---

## Applicant Logout

### Endpoint

```http
POST /auth/applicant/logout
```

Authentication

Required

---

## Applicant Profile

### Endpoint

```http
GET /auth/applicant/me
```

Authentication

Required

---

# Password Management

---

## Forgot Password

### Endpoint

```http
POST /auth/forgot-password
```

Authentication

Not Required

---

### Request

```json
{
  "email": "consultant@company.com"
}
```

---

### Response

Always return

```json
{
  "success": true,
  "message": "If an account exists, password reset instructions have been sent."
}
```

This prevents email enumeration attacks.

---

## Reset Password

### Endpoint

```http
POST /auth/reset-password
```

---

### Request

```json
{
  "token": "...",
  "password": "Password123!"
}
```

---

### Response

```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

---

## Change Password

### Endpoint

```http
POST /auth/change-password
```

Authentication

Required

---

### Request

```json
{
  "currentPassword": "OldPassword",
  "newPassword": "NewPassword123!"
}
```

---

### Response

```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

---

# Authentication Summary

Staff

- Login
- Refresh
- Logout
- Current User

Applicants

- Activate Account
- Login
- Logout
- Current User

Shared

- Forgot Password
- Reset Password
- Change Password

# 20. Applicant API

The Applicant API manages the complete applicant lifecycle.

Applicants are created by Staff.

Applicants cannot self-register.

Applicants may later activate their portal account using an invitation.

All Applicant endpoints require authentication unless explicitly stated.

---

# List Applicants

Returns a paginated list of Applicants.

## Endpoint

```http
GET /applicants
```

## Permission

```
applicant.view
```

## Query Parameters

| Parameter      | Type    | Description       |
| -------------- | ------- | ----------------- |
| page           | Integer | Page Number       |
| pageSize       | Integer | Number of Records |
| search         | String  | Search Applicants |
| status         | String  | Applicant Status  |
| assignedTo     | UUID    | Assigned Staff    |
| workflowStatus | String  | Workflow Status   |
| sortBy         | String  | Sort Field        |
| sortOrder      | String  | asc / desc        |

---

## Example

```http
GET /applicants?page=1&pageSize=20&search=john&status=active
```

---

## Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "applicantNumber": "APP-10001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@email.com",
      "phone": "+9779800000000",
      "status": "Active",
      "workflowStatus": "In Progress",
      "assignedConsultant": "Jane Smith"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 120,
    "totalPages": 6
  }
}
```

---

# Get Applicant

Returns complete Applicant information.

## Endpoint

```http
GET /applicants/{id}
```

## Permission

```
applicant.view
```

---

## Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "applicantNumber": "APP-10001",
    "firstName": "John",
    "middleName": "",
    "lastName": "Doe",
    "email": "john@email.com",
    "phone": "+9779800000000",
    "dateOfBirth": "2002-04-12",
    "nationality": "Nepal",
    "address": "...",
    "status": "Active",
    "workflowStatus": "In Progress",
    "assignedStaff": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "primary": true
      }
    ]
  }
}
```

---

# Create Applicant

Creates a new Applicant.

## Endpoint

```http
POST /applicants
```

## Permission

```
applicant.create
```

---

## Request

```json
{
  "firstName": "John",
  "middleName": "",
  "lastName": "Doe",
  "email": "john@email.com",
  "phone": "+9779800000000",
  "dateOfBirth": "2002-04-12",
  "nationality": "Nepal",
  "workflowTemplateId": "uuid",
  "assignedStaffId": "uuid"
}
```

---

## Business Rules

Upon creation the system automatically

- Generates Applicant Number
- Creates Applicant Workflow
- Copies Workflow Stages
- Creates Required Documents
- Creates Timeline Entry
- Assigns Consultant

---

## Response

```json
{
  "success": true,
  "message": "Applicant created successfully.",
  "data": {
    "id": "uuid",
    "applicantNumber": "APP-10001"
  }
}
```

---

# Update Applicant

## Endpoint

```http
PATCH /applicants/{id}
```

## Permission

```
applicant.update
```

---

## Request

Only modified fields need to be submitted.

```json
{
  "phone": "+9779811111111",
  "email": "new@email.com"
}
```

---

# Archive Applicant

Applicants are never permanently deleted.

## Endpoint

```http
DELETE /applicants/{id}
```

## Permission

```
applicant.archive
```

---

# Restore Applicant

## Endpoint

```http
POST /applicants/{id}/restore
```

## Permission

```
applicant.restore
```

---

# Assign Consultant

Assigns Staff members to an Applicant.

## Endpoint

```http
POST /applicants/{id}/assignments
```

## Permission

```
applicant.assign
```

---

## Request

```json
{
  "staffId": "uuid",
  "primary": true
}
```

---

# List Assigned Staff

```http
GET /applicants/{id}/assignments
```

---

# Remove Assignment

```http
DELETE /applicants/{id}/assignments/{assignmentId}
```

---

# Send Portal Invitation

Creates an Applicant Account if one does not exist and sends an invitation email.

## Endpoint

```http
POST /applicants/{id}/invite
```

## Permission

```
applicant.invite
```

---

## Response

```json
{
  "success": true,
  "message": "Invitation sent successfully."
}
```

---

# Resend Invitation

```http
POST /applicants/{id}/invite/resend
```

---

# Disable Applicant Portal

```http
PATCH /applicants/{id}/portal/disable
```

---

# Enable Applicant Portal

```http
PATCH /applicants/{id}/portal/enable
```

---

# Applicant Dashboard

Returns all information required by the Applicant Details page.

Instead of multiple API calls, the frontend loads one dashboard endpoint.

## Endpoint

```http
GET /applicants/{id}/dashboard
```

---

## Response

```json
{
  "success": true,
  "data": {
    "profile": {},
    "workflow": {},
    "documents": [],
    "tasks": [],
    "notes": [],
    "timeline": []
  }
}
```

---

# Applicant Statistics

Returns dashboard statistics.

## Endpoint

```http
GET /applicants/statistics
```

---

## Response

```json
{
  "success": true,
  "data": {
    "totalApplicants": 250,
    "activeApplicants": 180,
    "completedApplicants": 52,
    "pendingApplicants": 18
  }
}
```

---

# Applicant Timeline

```http
GET /applicants/{id}/timeline
```

Returns all timeline entries.

---

# Applicant Notes

```http
GET /applicants/{id}/notes
```

Returns all internal notes.

---

# Applicant Tasks

```http
GET /applicants/{id}/tasks
```

Returns all assigned tasks.

---

# Applicant API Summary

| Endpoint                                           | Description          |
| -------------------------------------------------- | -------------------- |
| GET /applicants                                    | List Applicants      |
| GET /applicants/{id}                               | Get Applicant        |
| POST /applicants                                   | Create Applicant     |
| PATCH /applicants/{id}                             | Update Applicant     |
| DELETE /applicants/{id}                            | Archive Applicant    |
| POST /applicants/{id}/restore                      | Restore Applicant    |
| POST /applicants/{id}/assignments                  | Assign Consultant    |
| GET /applicants/{id}/assignments                   | List Assignments     |
| DELETE /applicants/{id}/assignments/{assignmentId} | Remove Assignment    |
| POST /applicants/{id}/invite                       | Send Invitation      |
| POST /applicants/{id}/invite/resend                | Resend Invitation    |
| PATCH /applicants/{id}/portal/enable               | Enable Portal        |
| PATCH /applicants/{id}/portal/disable              | Disable Portal       |
| GET /applicants/{id}/dashboard                     | Applicant Dashboard  |
| GET /applicants/statistics                         | Applicant Statistics |
| GET /applicants/{id}/timeline                      | Timeline             |
| GET /applicants/{id}/notes                         | Notes                |
| GET /applicants/{id}/tasks                         | Tasks                |

# 21. Workflow API

The Workflow API manages Applicant workflow progression.

Workflow Templates define reusable business processes.

Applicant Workflows are created from Workflow Templates when an Applicant is created.

---

# List Workflow Templates

Returns all Workflow Templates.

## Endpoint

```http
GET /workflow-templates
```

## Permission

```
workflow.view
```

---

## Query Parameters

| Parameter | Description      |
| --------- | ---------------- |
| page      | Page Number      |
| pageSize  | Records Per Page |
| search    | Search by Name   |
| active    | Active Templates |

---

# Get Workflow Template

## Endpoint

```http
GET /workflow-templates/{id}
```

---

# Create Workflow Template

## Endpoint

```http
POST /workflow-templates
```

## Permission

```
workflow.manage
```

---

## Request

```json
{
  "name": "Australia Student Visa",
  "description": "Default workflow",
  "isDefault": true
}
```

---

# Update Workflow Template

## Endpoint

```http
PATCH /workflow-templates/{id}
```

---

# Archive Workflow Template

## Endpoint

```http
DELETE /workflow-templates/{id}
```

---

# List Template Stages

Returns every stage inside a template.

## Endpoint

```http
GET /workflow-templates/{id}/stages
```

---

# Add Workflow Stage

## Endpoint

```http
POST /workflow-templates/{id}/stages
```

---

## Request

```json
{
  "stageName": "University Application",
  "description": "Submit application",
  "stageOrder": 3,
  "estimatedDays": 14,
  "isRequired": true
}
```

---

# Update Workflow Stage

## Endpoint

```http
PATCH /workflow-stages/{id}
```

---

# Delete Workflow Stage

## Endpoint

```http
DELETE /workflow-stages/{id}
```

---

# Reorder Workflow Stages

Allows drag-and-drop ordering.

## Endpoint

```http
PUT /workflow-templates/{id}/stages/order
```

---

## Request

```json
{
  "stageIds": ["uuid-1", "uuid-2", "uuid-3", "uuid-4"]
}
```

---

# Applicant Workflow

Returns an Applicant's workflow.

## Endpoint

```http
GET /applicants/{id}/workflow
```

---

## Response

```json
{
  "success": true,
  "data": {
    "workflowId": "uuid",
    "status": "In Progress",
    "progress": 55,
    "currentStage": "University Application",
    "stages": []
  }
}
```

---

# Update Workflow Status

Updates the overall workflow.

## Endpoint

```http
PATCH /workflows/{id}
```

---

## Request

```json
{
  "status": "On Hold"
}
```

---

# List Workflow Stages

Returns every Applicant stage.

## Endpoint

```http
GET /workflows/{id}/stages
```

---

# Get Workflow Stage

## Endpoint

```http
GET /workflow-stages/{id}
```

---

# Start Stage

Marks a stage as Active.

## Endpoint

```http
POST /workflow-stages/{id}/start
```

---

# Complete Stage

Marks a stage as Completed.

## Endpoint

```http
POST /workflow-stages/{id}/complete
```

---

## Request

```json
{
  "remarks": "Documents verified successfully."
}
```

---

# Skip Stage

## Endpoint

```http
POST /workflow-stages/{id}/skip
```

---

## Request

```json
{
  "reason": "Not required for this Applicant."
}
```

---

# Reopen Stage

Allows an already completed stage to be reopened.

## Endpoint

```http
POST /workflow-stages/{id}/reopen
```

---

## Request

```json
{
  "reason": "Applicant submitted updated documents."
}
```

---

# Assign Staff to Stage

Assigns a Staff member to handle a stage.

## Endpoint

```http
PATCH /workflow-stages/{id}/assignment
```

---

## Request

```json
{
  "staffId": "uuid"
}
```

---

# Workflow Progress

Returns workflow completion percentage.

## Endpoint

```http
GET /workflows/{id}/progress
```

---

## Response

```json
{
  "success": true,
  "data": {
    "completedStages": 6,
    "totalStages": 10,
    "progress": 60,
    "currentStage": "Financial Verification"
  }
}
```

---

# Workflow Dashboard

Returns dashboard information.

## Endpoint

```http
GET /workflows/dashboard
```

---

## Response

```json
{
  "success": true,
  "data": {
    "activeWorkflows": 180,
    "completedWorkflows": 65,
    "onHold": 12,
    "cancelled": 4
  }
}
```

---

# Workflow API Summary

| Endpoint                                  | Description          |
| ----------------------------------------- | -------------------- |
| GET /workflow-templates                   | List Templates       |
| GET /workflow-templates/{id}              | Get Template         |
| POST /workflow-templates                  | Create Template      |
| PATCH /workflow-templates/{id}            | Update Template      |
| DELETE /workflow-templates/{id}           | Archive Template     |
| GET /workflow-templates/{id}/stages       | List Template Stages |
| POST /workflow-templates/{id}/stages      | Add Stage            |
| PATCH /workflow-stages/{id}               | Update Stage         |
| DELETE /workflow-stages/{id}              | Delete Stage         |
| PUT /workflow-templates/{id}/stages/order | Reorder Stages       |
| GET /applicants/{id}/workflow             | Applicant Workflow   |
| PATCH /workflows/{id}                     | Update Workflow      |
| GET /workflows/{id}/stages                | List Workflow Stages |
| GET /workflow-stages/{id}                 | Get Stage            |
| POST /workflow-stages/{id}/start          | Start Stage          |
| POST /workflow-stages/{id}/complete       | Complete Stage       |
| POST /workflow-stages/{id}/skip           | Skip Stage           |
| POST /workflow-stages/{id}/reopen         | Reopen Stage         |
| PATCH /workflow-stages/{id}/assignment    | Assign Staff         |
| GET /workflows/{id}/progress              | Workflow Progress    |
| GET /workflows/dashboard                  | Workflow Dashboard   |

---

# 22. Document API

The Document API manages document requirements, uploads, reviews, approvals, rejections, version history, and downloads.

The API stores metadata only.

Physical files are managed by the configured Storage Provider.

---

# List Document Requirements

## Endpoint

```http
GET /document-requirements
```

---

# Create Document Requirement

## Endpoint

```http
POST /document-requirements
```

---

# Update Document Requirement

## Endpoint

```http
PATCH /document-requirements/{id}
```

---

# Archive Document Requirement

## Endpoint

```http
DELETE /document-requirements/{id}
```

---

# List Applicant Documents

## Endpoint

```http
GET /applicants/{id}/documents
```

---

## Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "documentType": "Passport",
      "status": "Approved",
      "currentVersion": 2,
      "reviewedBy": "John Doe"
    }
  ]
}
```

---

# Get Document

## Endpoint

```http
GET /documents/{id}
```

---

# Upload Document

Creates Version 1 or a replacement version.

## Endpoint

```http
POST /documents/upload
```

## Content Type

```http
multipart/form-data
```

---

## Form Data

| Field                 | Type   |
| --------------------- | ------ |
| applicantId           | UUID   |
| documentRequirementId | UUID   |
| file                  | Binary |

---

## Response

```json
{
  "success": true,
  "message": "Document uploaded successfully."
}
```

---

# Replace Document

## Endpoint

```http
POST /documents/{id}/replace
```

Creates a new document version.

---

# Download Document

## Endpoint

```http
GET /documents/{id}/download
```

Returns a temporary signed download URL.

---

# Review Document

## Endpoint

```http
POST /documents/{id}/review
```

---

## Request

```json
{
  "comments": "Looks good."
}
```

---

# Approve Document

## Endpoint

```http
POST /documents/{id}/approve
```

---

## Request

```json
{
  "comments": "Verified."
}
```

---

# Reject Document

## Endpoint

```http
POST /documents/{id}/reject
```

---

## Request

```json
{
  "reason": "Image is blurry."
}
```

---

# Request Re-upload

## Endpoint

```http
POST /documents/{id}/request-reupload
```

---

## Request

```json
{
  "reason": "Please upload a higher quality scan."
}
```

---

# Document Version History

## Endpoint

```http
GET /documents/{id}/versions
```

---

# Get Specific Version

## Endpoint

```http
GET /document-versions/{id}
```

---

# Download Specific Version

## Endpoint

```http
GET /document-versions/{id}/download
```

---

# Document Statistics

## Endpoint

```http
GET /documents/statistics
```

---

## Response

```json
{
  "success": true,
  "data": {
    "uploaded": 420,
    "approved": 355,
    "rejected": 41,
    "pendingReview": 24
  }
}
```

---

# Document API Summary

| Endpoint                              | Description              |
| ------------------------------------- | ------------------------ |
| GET /document-requirements            | List Requirements        |
| POST /document-requirements           | Create Requirement       |
| PATCH /document-requirements/{id}     | Update Requirement       |
| DELETE /document-requirements/{id}    | Archive Requirement      |
| GET /applicants/{id}/documents        | Applicant Documents      |
| GET /documents/{id}                   | Get Document             |
| POST /documents/upload                | Upload Document          |
| POST /documents/{id}/replace          | Replace Document         |
| GET /documents/{id}/download          | Download Current Version |
| POST /documents/{id}/review           | Review Document          |
| POST /documents/{id}/approve          | Approve Document         |
| POST /documents/{id}/reject           | Reject Document          |
| POST /documents/{id}/request-reupload | Request Re-upload        |
| GET /documents/{id}/versions          | Version History          |
| GET /document-versions/{id}           | Get Version              |
| GET /document-versions/{id}/download  | Download Version         |
| GET /documents/statistics             | Document Dashboard       |

# 23. Task API

The Task API manages internal work assigned to Staff.

Tasks help consultants track follow-ups, deadlines, document reviews, and other operational activities.

Tasks are internal only and are not visible to Applicants unless future configuration allows it.

---

# List Tasks

Returns a paginated list of tasks.

## Endpoint

```http
GET /tasks
```

## Permission

```
task.view
```

---

## Query Parameters

| Parameter   | Description      |
| ----------- | ---------------- |
| page        | Page Number      |
| pageSize    | Records Per Page |
| status      | Task Status      |
| priority    | Task Priority    |
| assignedTo  | Staff ID         |
| applicantId | Applicant ID     |
| dueDate     | Due Date         |
| search      | Search Title     |

---

# Get Task

## Endpoint

```http
GET /tasks/{id}
```

---

# Create Task

## Endpoint

```http
POST /tasks
```

## Permission

```
task.create
```

---

## Request

```json
{
  "title": "Follow up with Applicant",
  "description": "Request updated bank statement.",
  "priority": "High",
  "assignedTo": "uuid",
  "applicantId": "uuid",
  "dueDate": "2026-07-10"
}
```

---

# Update Task

## Endpoint

```http
PATCH /tasks/{id}
```

---

# Complete Task

## Endpoint

```http
POST /tasks/{id}/complete
```

---

## Request

```json
{
  "remarks": "Applicant submitted updated documents."
}
```

---

# Reopen Task

## Endpoint

```http
POST /tasks/{id}/reopen
```

---

# Archive Task

## Endpoint

```http
DELETE /tasks/{id}
```

---

# My Tasks

Returns tasks assigned to the authenticated Staff member.

## Endpoint

```http
GET /tasks/my
```

---

# Overdue Tasks

Returns overdue tasks.

## Endpoint

```http
GET /tasks/overdue
```

---

# Upcoming Tasks

Returns tasks due within the next seven days.

## Endpoint

```http
GET /tasks/upcoming
```

---

# Task Statistics

## Endpoint

```http
GET /tasks/statistics
```

---

## Response

```json
{
  "success": true,
  "data": {
    "total": 140,
    "completed": 92,
    "pending": 31,
    "overdue": 17
  }
}
```

---

# Task API Summary

| Endpoint                  | Description    |
| ------------------------- | -------------- |
| GET /tasks                | List Tasks     |
| GET /tasks/{id}           | Get Task       |
| POST /tasks               | Create Task    |
| PATCH /tasks/{id}         | Update Task    |
| POST /tasks/{id}/complete | Complete Task  |
| POST /tasks/{id}/reopen   | Reopen Task    |
| DELETE /tasks/{id}        | Archive Task   |
| GET /tasks/my             | My Tasks       |
| GET /tasks/overdue        | Overdue Tasks  |
| GET /tasks/upcoming       | Upcoming Tasks |
| GET /tasks/statistics     | Task Dashboard |

---

# 24. Notes API

Notes are private internal comments attached to Applicants.

Applicants cannot view Staff Notes.

Every Note is recorded in the Timeline.

---

# List Notes

## Endpoint

```http
GET /applicants/{id}/notes
```

---

# Get Note

## Endpoint

```http
GET /notes/{id}
```

---

# Create Note

## Endpoint

```http
POST /applicants/{id}/notes
```

---

## Request

```json
{
  "note": "Applicant requested extension for document submission."
}
```

---

# Update Note

## Endpoint

```http
PATCH /notes/{id}
```

---

# Archive Note

## Endpoint

```http
DELETE /notes/{id}
```

---

# Pin Note

Pinned notes always appear first.

## Endpoint

```http
POST /notes/{id}/pin
```

---

# Unpin Note

## Endpoint

```http
POST /notes/{id}/unpin
```

---

# Notes API Summary

| Endpoint                    | Description  |
| --------------------------- | ------------ |
| GET /applicants/{id}/notes  | List Notes   |
| GET /notes/{id}             | Get Note     |
| POST /applicants/{id}/notes | Create Note  |
| PATCH /notes/{id}           | Update Note  |
| DELETE /notes/{id}          | Archive Note |
| POST /notes/{id}/pin        | Pin Note     |
| POST /notes/{id}/unpin      | Unpin Note   |

---

# 25. Timeline API

The Timeline provides a complete activity history for every Applicant.

Timeline entries are generated automatically by the system.

Users cannot manually edit Timeline records.

---

# List Timeline Entries

## Endpoint

```http
GET /applicants/{id}/timeline
```

---

## Query Parameters

| Parameter | Description      |
| --------- | ---------------- |
| page      | Page Number      |
| pageSize  | Records Per Page |
| eventType | Activity Type    |

---

# Get Timeline Entry

## Endpoint

```http
GET /timeline/{id}
```

---

# Timeline Event Types

Examples include:

- Applicant Created
- Applicant Updated
- Workflow Started
- Workflow Completed
- Stage Completed
- Document Uploaded
- Document Approved
- Document Rejected
- Document Replaced
- Task Created
- Task Completed
- Staff Assigned
- Portal Invitation Sent
- Portal Activated
- Login
- Password Changed

---

# Timeline Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event": "Document Approved",
      "performedBy": "Jane Smith",
      "timestamp": "2026-06-29T10:00:00Z"
    }
  ]
}
```

---

# Timeline API Summary

| Endpoint                      | Description        |
| ----------------------------- | ------------------ |
| GET /applicants/{id}/timeline | Applicant Timeline |
| GET /timeline/{id}            | Get Timeline Entry |

---

# 26. Notification API

Notifications inform users about important events within the platform.

Notifications may be delivered in-app and can later be extended to email, push notifications, or SMS.

---

# List Notifications

## Endpoint

```http
GET /notifications
```

---

## Query Parameters

| Parameter  | Description      |
| ---------- | ---------------- |
| page       | Page Number      |
| pageSize   | Records Per Page |
| unreadOnly | Boolean          |

---

# Get Notification

## Endpoint

```http
GET /notifications/{id}
```

---

# Mark as Read

## Endpoint

```http
PATCH /notifications/{id}/read
```

---

# Mark All as Read

## Endpoint

```http
PATCH /notifications/read-all
```

---

# Delete Notification

## Endpoint

```http
DELETE /notifications/{id}
```

Soft delete only.

---

# Notification Preferences

## Endpoint

```http
GET /notification-preferences
```

---

# Update Notification Preferences

## Endpoint

```http
PATCH /notification-preferences
```

---

## Request

```json
{
  "email": true,
  "inApp": true,
  "push": false
}
```

---

# Notification API Summary

| Endpoint                        | Description         |
| ------------------------------- | ------------------- |
| GET /notifications              | List Notifications  |
| GET /notifications/{id}         | Get Notification    |
| PATCH /notifications/{id}/read  | Mark as Read        |
| PATCH /notifications/read-all   | Mark All as Read    |
| DELETE /notifications/{id}      | Delete Notification |
| GET /notification-preferences   | Get Preferences     |
| PATCH /notification-preferences | Update Preferences  |

# 27. Dashboard API

The Dashboard API provides aggregated information required by dashboards.

Dashboard endpoints are optimized to minimize frontend API requests.

Dashboard APIs return summary information only.

Detailed information should be retrieved using the corresponding resource endpoints.

---

# Staff Dashboard

Returns statistics for the authenticated Staff member.

## Endpoint

```http
GET /dashboard
```

---

## Permission

```
dashboard.view
```

---

## Response

```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalApplicants": 325,
      "activeApplicants": 240,
      "completedApplicants": 61,
      "pendingApplicants": 24
    },
    "documents": {
      "pendingReview": 18,
      "approvedToday": 12,
      "rejectedToday": 3
    },
    "tasks": {
      "assigned": 26,
      "completedToday": 7,
      "overdue": 4
    },
    "workflow": {
      "active": 240,
      "completed": 61,
      "onHold": 12
    }
  }
}
```

---

# My Dashboard

Returns personalized dashboard information.

## Endpoint

```http
GET /dashboard/me
```

---

## Response

```json
{
  "success": true,
  "data": {
    "myApplicants": 48,
    "myTasks": 14,
    "overdueTasks": 2,
    "pendingDocuments": 9,
    "notifications": 4
  }
}
```

---

# Dashboard Charts

Returns chart-ready data.

## Endpoint

```http
GET /dashboard/charts
```

---

## Response

```json
{
  "success": true,
  "data": {
    "monthlyApplicants": [],
    "workflowDistribution": [],
    "documentStatus": [],
    "taskCompletion": []
  }
}
```

---

# Dashboard API Summary

| Endpoint              | Description            |
| --------------------- | ---------------------- |
| GET /dashboard        | Organization Dashboard |
| GET /dashboard/me     | My Dashboard           |
| GET /dashboard/charts | Dashboard Charts       |

---

# 28. Organization Settings API

Organization Settings define how the organization uses the platform.

Only Administrators may access these endpoints.

---

# Get Organization

## Endpoint

```http
GET /organization
```

---

# Update Organization

## Endpoint

```http
PATCH /organization
```

---

## Request

```json
{
  "name": "ABC Education Consultancy",
  "email": "info@abc.com",
  "phone": "+9779800000000",
  "address": "Kathmandu"
}
```

---

# Branding

## Endpoint

```http
PATCH /organization/branding
```

---

Allows updating

- Logo
- Organization Name
- Primary Color
- Secondary Color

---

# Workflow Settings

## Endpoint

```http
GET /organization/workflow-settings
```

---

# Update Workflow Settings

## Endpoint

```http
PATCH /organization/workflow-settings
```

---

# Portal Settings

## Endpoint

```http
GET /organization/portal-settings
```

---

Allows configuration of:

- Applicant Portal
- Registration Rules
- Invitation Expiration
- Password Policy

---

# Notification Settings

## Endpoint

```http
GET /organization/notification-settings
```

---

# Update Notification Settings

## Endpoint

```http
PATCH /organization/notification-settings
```

---

# Storage Settings

## Endpoint

```http
GET /organization/storage-settings
```

---

Displays

- Storage Provider
- Used Storage
- Remaining Storage

---

# Organization API Summary

| Endpoint                                  | Description                  |
| ----------------------------------------- | ---------------------------- |
| GET /organization                         | Organization                 |
| PATCH /organization                       | Update Organization          |
| PATCH /organization/branding              | Branding                     |
| GET /organization/workflow-settings       | Workflow Settings            |
| PATCH /organization/workflow-settings     | Update Workflow Settings     |
| GET /organization/portal-settings         | Portal Settings              |
| PATCH /organization/portal-settings       | Update Portal Settings       |
| GET /organization/notification-settings   | Notification Settings        |
| PATCH /organization/notification-settings | Update Notification Settings |
| GET /organization/storage-settings        | Storage Settings             |

---

# 29. File Upload Standards

All uploaded files must pass validation before storage.

---

## Allowed File Types

- PDF
- JPG
- JPEG
- PNG
- DOCX

---

## Maximum File Size

Default

```
20 MB
```

Configurable by organization.

---

## File Naming

Files are renamed internally.

Original filenames are stored only as metadata.

Example

```
4cbb9c9f-3c11-49b1-bdb2.pdf
```

Never trust user-supplied filenames.

---

## Virus Scanning

Development

Not Required

Pilot

Optional

Production

Recommended before storing files.

---

## Storage Strategy

Development

```
Local Storage
```

Pilot

```
AWS S3
```

Production

```
AWS S3
```

or

```
Cloudflare R2
```

using the same Storage Provider interface.

---

## File Versioning

Replacing a document creates a new version.

Older versions remain available for auditing.

---

## Download URLs

Files should never be publicly accessible.

Downloads use temporary signed URLs.

Default expiration

```
5 minutes
```

---

# 30. Rate Limiting

To prevent abuse, the API applies rate limits.

---

Authentication

```
10 requests / minute
```

---

Password Reset

```
5 requests / hour
```

---

General API

```
100 requests / minute
```

---

File Upload

```
20 uploads / hour
```

---

Exceeded limits return

```
429 Too Many Requests
```

---

# 31. API Security

Security applies to every endpoint.

---

Authentication

JWT

---

Authorization

RBAC

---

Passwords

BCrypt

Minimum Cost Factor

```
12
```

---

Transport

HTTPS Only

Production environments must never allow HTTP.

---

Headers

Recommended security headers

```
Strict-Transport-Security

X-Content-Type-Options

X-Frame-Options

Content-Security-Policy
```

---

Input Validation

Every request must be validated.

Unexpected properties should be rejected.

---

Audit Logging

Sensitive operations should always be logged.

Examples

- Login
- Password Change
- Document Approval
- Workflow Updates
- User Creation
- Permission Changes

---

Soft Deletes

Critical business records should never be permanently deleted.

Examples

- Applicants
- Documents
- Tasks
- Staff

---

# 32. OpenAPI / Swagger

The backend automatically generates OpenAPI documentation.

Development URL

```http
http://localhost:3001/docs
```

---

Swagger should document

- Every Endpoint
- Request DTOs
- Response DTOs
- Authentication
- Permissions
- Error Responses

Swagger must be generated directly from NestJS decorators.

---

# 33. API Versioning

Every endpoint begins with

```
/api/v1
```

Future versions

```
/api/v2

/api/v3
```

Breaking changes require a new version.

Minor additions should remain backward compatible.

---

# 34. Webhooks (Future)

Future integrations may subscribe to platform events.

Examples

- Applicant Created
- Applicant Updated
- Workflow Completed
- Document Uploaded
- Document Approved
- Document Rejected
- Task Completed

Webhook payloads will include

- Event Type
- Timestamp
- Resource ID
- Organization ID
- Event Data

---

# 35. HTTP Status Codes

| Code | Description                |
| ---- | -------------------------- |
| 200  | OK                         |
| 201  | Created                    |
| 204  | No Content                 |
| 400  | Bad Request                |
| 401  | Unauthorized               |
| 403  | Forbidden                  |
| 404  | Not Found                  |
| 409  | Conflict                   |
| 413  | Payload Too Large          |
| 415  | Unsupported Media Type     |
| 422  | Business Validation Failed |
| 429  | Too Many Requests          |
| 500  | Internal Server Error      |

---

# 36. Complete API Summary

## Authentication

- Staff Authentication
- Applicant Authentication
- Password Management

---

## Staff

- CRUD
- Role Assignment
- Account Management

---

## Roles & Permissions

- Role Management
- Permission Management

---

## Applicants

- CRUD
- Assignment
- Invitation
- Dashboard
- Statistics

---

## Workflow

- Templates
- Stages
- Progress
- Assignments

---

## Documents

- Upload
- Replace
- Review
- Approval
- Rejection
- Download
- Version History

---

## Tasks

- CRUD
- Assignment
- Completion
- Dashboard

---

## Notes

- CRUD
- Pinning

---

## Timeline

- Activity History

---

## Notifications

- In-App Notifications
- Preferences

---

## Dashboard

- Organization Dashboard
- Personal Dashboard
- Charts

---

## Organization

- Profile
- Branding
- Workflow Settings
- Portal Settings
- Notification Settings
- Storage Settings

---

# Guiding Principles

The API should always remain:

- RESTful
- Versioned
- Secure
- Consistent
- Well Documented
- Backward Compatible
- Provider Agnostic
- Easy to Consume

Business logic belongs in the backend.

The API is the single source of truth for every client application.

---

# End of Document
