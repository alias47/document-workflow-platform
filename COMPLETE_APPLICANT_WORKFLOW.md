# Complete Applicant Workflow — End-to-End Process

This is the **full end-to-end process** for creating applicants, sending invitations, and activating their portal accounts.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Step 1: Staff Login](#step-1-staff-login)
3. [Step 2: Create an Applicant](#step-2-create-an-applicant)
4. [Step 3: Send Portal Invitation](#step-3-send-portal-invitation)
5. [Step 4: Applicant Receives Email](#step-4-applicant-receives-email)
6. [Step 5: Applicant Activates Account](#step-5-applicant-activates-account)
7. [Step 6: Applicant Logs In](#step-6-applicant-logs-in)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Database Changes](#database-changes)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

The applicant onboarding follows a **consultant-driven model**:

1. **Staff creates applicant** → System auto-assigns them to a workflow stage and creates a portal account
2. **Staff sends invitation** → System generates a one-time activation token and emails it
3. **Applicant clicks link** → Activation page validates the token and asks for a password
4. **Applicant sets password** → Password is hashed (Argon2), account is activated, tokens are invalidated
5. **Applicant can now log in** → Uses email + password to access the portal

**Key principle:** Applicants never self-register. Staff controls the entire process.

---

## Step 1: Staff Login

### Frontend: Dashboard Login

- Navigate to: `http://localhost:3000`
- Email: `admin@example.com`
- Password: `NewPass@1234!` (or value from `SEED_ADMIN_PASSWORD` env var)
- Role: Admin (all permissions)

### API: Staff Login (if building a client)

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "NewPass@1234!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "profile": {
      "id": "staff-uuid",
      "firstName": "System",
      "lastName": "Admin",
      "email": "admin@example.com",
      "role": "Admin",
      "organizationId": "org-uuid"
    },
    "mustChangePassword": true
  }
}
```

**Cookies Set:**

- `access_token` (HttpOnly, Secure, 15-minute expiry)
- `refresh_token` (HttpOnly, Secure, 7-day expiry)

---

## Step 2: Create an Applicant

### Frontend: New Applicant Form

1. Navigate to: **Applicants → New Applicant**
2. Fill out the form:
   - **First Name** ✓ Required
   - **Last Name** ✓ Required
   - Middle Name (optional)
   - Gender (optional)
   - Date of Birth (optional)
   - Nationality (optional)
   - **Email** (optional but recommended for portal access)
   - Phone (optional)
   - Address (optional)
   - City (optional)
   - Country (optional)
   - **Assigned Staff** ✓ Required (select who manages this applicant)
3. Submit form

### Backend: What Happens (Transactional)

When you submit, the backend does ALL of this in a **single transaction** (atomic):

```typescript
// 1. Create Applicant record
const applicant = await tx.applicant.create({
  data: {
    organizationId: 'org-uuid',
    applicantNumber: 'APP-2026-0001', // Auto-generated
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+977-9800000001',
    // ... other fields
    createdBy: 'staff-uuid', // Current user
  },
});

// 2. Create Primary Assignment (staff who will manage this applicant)
await tx.applicantAssignment.create({
  data: {
    organizationId: 'org-uuid',
    applicantId: applicant.id,
    staffId: 'assigned-staff-uuid',
    assignedBy: 'current-staff-uuid',
    isPrimary: true,
  },
});

// 3. Auto-assign Default Workflow Stage (e.g., "New Inquiry")
await tx.applicantWorkflow.create({
  data: {
    organizationId: 'org-uuid',
    applicantId: applicant.id,
    currentStageId: 'new-inquiry-stage-uuid',
    createdBy: 'staff-uuid',
  },
});

// 4. Create Workflow History (audit trail)
await tx.workflowHistory.create({
  data: {
    organizationId: 'org-uuid',
    applicantId: applicant.id,
    fromStageId: null,
    toStageId: 'new-inquiry-stage-uuid',
    changedBy: 'staff-uuid',
    comment: 'Auto-assigned to default stage',
  },
});

// 5. Assign All Active Document Requirements
await tx.document.create({
  // ... link each document requirement to this applicant
});

// 6. Create Activity Log Entry
await tx.applicantActivity.create({
  data: {
    organizationId: 'org-uuid',
    applicantId: applicant.id,
    type: 'applicant.created',
    title: 'Applicant created',
    actorId: 'staff-uuid',
  },
});

// 7. Create Portal Account (if email provided)
await tx.portalAccount.create({
  data: {
    organizationId: 'org-uuid',
    applicantId: applicant.id,
    email: 'aarav.sharma@example.com',
    status: 'pending', // Not yet activated
    mustChangePass: true,
  },
});
```

### API: Create Applicant

```bash
POST /api/v1/applicants
Authorization: Bearer <staff-access-token>
Content-Type: application/json

{
  "firstName": "Aarav",
  "lastName": "Sharma",
  "email": "aarav.sharma@example.com",
  "phone": "+977-9800000001",
  "gender": "male",
  "dateOfBirth": "1999-04-12",
  "nationality": "Nepali",
  "city": "Kathmandu",
  "country": "Nepal",
  "assignedStaffId": "assigned-staff-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Applicant created successfully",
  "data": {
    "id": "applicant-uuid",
    "applicantNumber": "APP-2026-0001"
  }
}
```

### Database: What Was Created

After creation, these tables have new rows:

| Table                  | Record                 | Status        |
| ---------------------- | ---------------------- | ------------- |
| `applicant`            | Aarav Sharma           | `active`      |
| `applicant_assignment` | Assigned to staff      | `active`      |
| `applicant_workflow`   | In "New Inquiry" stage | `current`     |
| `workflow_history`     | Stage assignment       | `audit trail` |
| `applicant_activity`   | "Applicant created"    | `log entry`   |
| `portal_account`       | For email              | `pending`     |
| `document`             | All requirements       | `pending`     |

---

## Step 3: Send Portal Invitation

### Frontend: Send Invitation from Applicant Detail Page

1. Navigate to: **Applicants → [Applicant Name]**
2. Scroll to "Portal Account" section
3. Click **"Send Invitation"** button
4. Confirmation: "Invitation sent successfully"

### Backend: What Happens

```typescript
// 1. Validate applicant exists and has email
const applicant = await repo.findApplicant(applicantId, organizationId);
if (!applicant?.email) throw new BadRequestException('No email');

// 2. Guard: Don't send if already activated
const existing = await repo.findLatestByApplicant(applicantId, organizationId);
if (existing?.portalAccount?.activatedAt) {
  throw new ConflictException('Account already activated');
}

// 3. Guard: Don't send if active invitation exists
const active = await repo.findActiveByApplicant(applicantId, organizationId);
if (active && !active.acceptedAt && !active.revokedAt && active.expiresAt > now) {
  throw new ConflictException('Active invitation already exists');
}

// 4. Find or create portal account
const portalAccount = await repo.findOrCreatePortalAccount(
  organizationId,
  applicantId,
  applicant.email
);

// 5. Generate secure token
const rawToken = crypto.randomBytes(32).toString('hex');
//   Example: "a3f2b1c9d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0"
const tokenHash = hash(rawToken);
const expiresAt = now + 7 days;

// 6. Store invitation record
await repo.create({
  organizationId,
  applicantId,
  portalAccountId: portalAccount.id,
  tokenHash,  // Only hash stored in DB, not the raw token
  expiresAt,
  createdBy: staffId
});

// 7. Log audit event
await auditService.log({
  action: 'invitation.created',
  resourceType: 'applicant',
  resourceId: applicantId
});

// 8. Record activity
await activityService.record({
  type: 'portal_invitation_sent',
  title: 'Portal invitation sent'
});

// 9. Send invitation email
const activationLink = `https://app.example.com/applicant/activate?token=${rawToken}`;
await emailService.send({
  to: applicant.email,
  template: 'APPLICANT_PORTAL_INVITATION',
  variables: {
    applicantName: 'Aarav Sharma',
    organizationName: 'Default Organization',
    activationLink: activationLink,
    expiresIn: '7 days'
  }
});
```

### API: Send Invitation

```bash
POST /api/v1/applicants/{applicantId}/invitation
Authorization: Bearer <staff-access-token>

# No body needed — the API figures out the applicant from the path
```

**Response:**

```json
{
  "success": true,
  "message": "Invitation sent",
  "data": null
}
```

### Database: What Changed

| Table                  | Change                                             |
| ---------------------- | -------------------------------------------------- |
| `applicant_invitation` | New row with `tokenHash`, `expiresAt`, `createdAt` |
| `audit_log`            | New entry: `invitation.created`                    |
| `applicant_activity`   | New entry: "Portal invitation sent"                |

**Note:** Raw token is NEVER stored in DB — only the hash is. This is for security.

---

## Step 4: Applicant Receives Email

### In Development: Mailpit

- Open: `http://localhost:1025` (Mailpit web UI)
- You'll see the email from the system
- Subject: "Your Portal Account Invitation"
- Body contains:
  - Greeting with applicant name
  - Organization name
  - Activation link: `http://localhost:3000/applicant/activate?token=<raw-token>`
  - Expiration notice: "This link expires in 7 days"
  - Call to action: "Click the link to set your password"

### In Production: Real Email

- Email is sent via configured provider (AWS SES, SendGrid, etc.)
- Applicant receives at their email address
- Link is the same format

### Email Content Example

```
Subject: Your Portal Account Invitation

Hello Aarav,

You've been invited to access your portal for Default Organization.

Click the link below to activate your account and set your password:

https://app.example.com/applicant/activate?token=a3f2b1c9d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0

This link will expire in 7 days.

If you didn't expect this invitation, please ignore this email.

Best regards,
Default Organization
```

### Email Sent Via

```typescript
// Backend calls NotificationService
await notificationService.notify({
  organizationId: 'org-uuid',
  template: NOTIFICATION_TEMPLATES.APPLICANT_PORTAL_INVITATION,
  recipient: 'aarav.sharma@example.com',
  variables: {
    applicantName: 'Aarav Sharma',
    organizationName: 'Default Organization',
    activationLink: 'http://...',
  },
});
```

---

## Step 5: Applicant Activates Account

### Frontend: Activation Page (Public, No Auth Required)

**URL from email:**

```
http://localhost:3000/applicant/activate?token=<raw-token>
```

### Step 5a: Token Validation

When the applicant clicks the link:

1. Frontend extracts token from URL query param
2. Calls validation endpoint:

```bash
GET /api/v1/applicant/activate?token=a3f2b1c9d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

3. Backend validates:
   - Token hash matches a record in `applicant_invitation`
   - Not revoked (`revokedAt` is null)
   - Not already accepted (`acceptedAt` is null)
   - Not expired (`expiresAt` > now)

4. Response:

```json
{
  "success": true,
  "message": "Token validated",
  "data": {
    "valid": true,
    "reason": null,
    "applicantName": "Aarav Sharma",
    "organizationName": "Default Organization"
  }
}
```

**Invalid responses:**

```json
// Token doesn't exist
{
  "valid": false,
  "reason": "invalid",
  "applicantName": null,
  "organizationName": null
}

// Token was revoked by staff
{
  "valid": false,
  "reason": "revoked",
  "applicantName": null,
  "organizationName": null
}

// Account already activated
{
  "valid": false,
  "reason": "already_activated",
  "applicantName": null,
  "organizationName": null
}

// Link has expired
{
  "valid": false,
  "reason": "expired",
  "applicantName": null,
  "organizationName": null
}
```

### Step 5b: Password Entry

If token is valid, frontend shows a form:

```
┌─────────────────────────────────────────┐
│  Activate Your Account                  │
├─────────────────────────────────────────┤
│  Welcome, Aarav Sharma                  │
│  Default Organization                  │
│                                         │
│  Set Your Password                      │
│  ┌─────────────────────────────────┐   │
│  │ Password: [••••••••]            │   │
│  └─────────────────────────────────┘   │
│  Password must contain:                 │
│  ✓ Uppercase letter (A-Z)              │
│  ✓ Lowercase letter (a-z)              │
│  ✓ Number (0-9)                        │
│  ✓ Special character (!@#$%^&*)        │
│  ✓ At least 8 characters               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Confirm Password: [••••••••]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ Activate Account ] [ Cancel ]        │
└─────────────────────────────────────────┘
```

**Password Requirements:**

- Minimum 8 characters
- Must include uppercase letter (A-Z)
- Must include lowercase letter (a-z)
- Must include number (0-9)
- Must include special character (!@#$%^&*()_+-=[]{};':"\\|,.<>/?]

**Example valid passwords:**

- `SecurePass@123`
- `MyP@ssw0rd!`
- `ApplicantTest@2024`

**Example invalid passwords:**

- `password` (no uppercase, no number, no special char)
- `Pass@123` (only 8 chars, just barely valid)
- `PASSWORD123!` (no lowercase)

### Step 5c: Account Activation

When applicant submits the form:

```bash
POST /api/v1/applicant/activate
Content-Type: application/json

{
  "token": "a3f2b1c9d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0",
  "password": "SecurePass@123"
}
```

**Backend processes:**

```typescript
// 1. Hash token and find invitation
const tokenHash = hash(token);
const invitation = await repo.findByTokenHash(tokenHash);
if (!invitation) throw new BadRequestException('Invalid or expired token');

// 2. Validate state (re-check all guards)
if (invitation.revokedAt) throw new BadRequestException('Invitation revoked');
if (invitation.acceptedAt) throw new ConflictException('Already activated');
if (invitation.expiresAt < now) throw new BadRequestException('Token expired');

// 3. Hash password with Argon2
const passwordHash = await argon2.hash(newPassword);

// 4. Update portal account
await repo.updatePortalAccount(invitation.portalAccountId, {
  passwordHash,
  status: 'active',
  activatedAt: now,
});

// 5. Mark invitation as accepted
await repo.markInvitationAccepted(invitation.id, {
  acceptedAt: now,
});

// 6. Revoke all other pending invitations for this applicant
await repo.revokeAllActiveByApplicant(invitation.applicantId, organizationId);

// 7. Revoke any existing portal sessions (paranoia)
await repo.revokeAllPortalRefreshTokens(invitation.portalAccountId);

// 8. Log audit event
await auditService.log({
  action: 'invitation.accepted',
  resourceType: 'applicant',
  resourceId: invitation.applicantId,
});

// 9. Record activity
await activityService.record({
  type: 'portal_invitation_accepted',
  title: 'Portal account activated',
});
```

**Response:**

```json
{
  "success": true,
  "message": "Account activated successfully",
  "data": null
}
```

### Database: What Changed

| Table                  | Field          | Before    | After                  |
| ---------------------- | -------------- | --------- | ---------------------- |
| `portal_account`       | `passwordHash` | `NULL`    | `$argon2...`           |
| `portal_account`       | `status`       | `pending` | `active`               |
| `portal_account`       | `activatedAt`  | `NULL`    | `2026-07-06T14:30:00Z` |
| `applicant_invitation` | `acceptedAt`   | `NULL`    | `2026-07-06T14:30:00Z` |

### Frontend: Success Page

After activation, user sees:

```
┌──────────────────────────────┐
│  ✓ Success!                  │
├──────────────────────────────┤
│  Your account has been       │
│  activated successfully.     │
│                              │
│  Redirecting to login...     │
│  (3 seconds)                 │
└──────────────────────────────┘
```

Then auto-redirects to: `http://localhost:3000/applicant/login`

---

## Step 6: Applicant Logs In

### Frontend: Applicant Login Page

Navigate to: `http://localhost:3000/applicant/login`

```
┌─────────────────────────────────────┐
│  Portal Login                       │
├─────────────────────────────────────┤
│  Email: [aarav.sharma@example.com]  │
│  Password: [••••••••••]             │
│  [ Login ]  [ Forgot Password? ]    │
└─────────────────────────────────────┘
```

### API: Applicant Login

```bash
POST /api/v1/applicant-auth/login
Content-Type: application/json

{
  "email": "aarav.sharma@example.com",
  "password": "SecurePass@123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "mustChangePassword": false, // Only true on first login if not set during activation
    "profile": {
      "id": "portal-account-uuid",
      "email": "aarav.sharma@example.com",
      "firstName": "Aarav",
      "lastName": "Sharma",
      "applicantNumber": "APP-2026-0001"
    }
  }
}
```

**Cookies Set:**

- `applicant_access_token` (HttpOnly, Secure, 15-minute expiry)
- `applicant_refresh_token` (HttpOnly, Secure, 7-day expiry)

### Frontend: Portal Dashboard

After login, applicant can:

1. **View Profile** → `/applicant/profile`
2. **View Documents** → `/applicant/documents`
   - See all uploaded/required documents
   - Download approved documents
   - Upload new documents
3. **View Workflow Status** → Dashboard shows current stage
4. **Change Password** → `/applicant/change-password`
5. **Logout** → `POST /api/v1/applicant-auth/logout`

---

## API Endpoints Reference

### Staff Endpoints (Require Authentication + Permissions)

| Method  | Endpoint                                    | Purpose                 | Permission         |
| ------- | ------------------------------------------- | ----------------------- | ------------------ |
| `POST`  | `/api/v1/applicants`                        | Create applicant        | `applicant.create` |
| `GET`   | `/api/v1/applicants`                        | List applicants         | `applicant.view`   |
| `GET`   | `/api/v1/applicants/{id}`                   | Get applicant details   | `applicant.view`   |
| `PATCH` | `/api/v1/applicants/{id}`                   | Update applicant        | `applicant.update` |
| `GET`   | `/api/v1/applicants/{id}/invitation`        | Check invitation status | `applicant.view`   |
| `POST`  | `/api/v1/applicants/{id}/invitation`        | Send invitation         | `applicant.create` |
| `POST`  | `/api/v1/applicants/{id}/invitation/resend` | Resend invitation       | `applicant.create` |
| `POST`  | `/api/v1/applicants/{id}/invitation/revoke` | Revoke invitation       | `applicant.create` |

### Public Endpoints (No Auth Required)

| Method | Endpoint                               | Purpose                        |
| ------ | -------------------------------------- | ------------------------------ |
| `GET`  | `/api/v1/applicant/activate?token=...` | Validate activation token      |
| `POST` | `/api/v1/applicant/activate`           | Activate account with password |
| `POST` | `/api/v1/applicant-auth/login`         | Applicant login                |

### Applicant-Only Endpoints (Require Applicant Auth)

| Method | Endpoint                                 | Purpose             |
| ------ | ---------------------------------------- | ------------------- |
| `GET`  | `/api/v1/applicant-auth/me`              | Get current profile |
| `POST` | `/api/v1/applicant-auth/change-password` | Change password     |
| `POST` | `/api/v1/applicant-auth/logout`          | Logout              |
| `POST` | `/api/v1/applicant-auth/refresh`         | Refresh token       |

---

## Database Changes

### Tables Involved

```sql
-- Staff creates applicant
applicant
├── id (UUID)
├── organizationId (UUID)
├── applicantNumber (STRING) — e.g., "APP-2026-0001"
├── firstName
├── lastName
├── email
├── phone
├── status (active, inactive, archived)
├── createdBy (staff UUID)
├── createdAt
├── updatedAt

-- Staff assigned to applicant
applicant_assignment
├── id (UUID)
├── organizationId (UUID)
├── applicantId (UUID) → applicant.id
├── staffId (UUID) → staff.id
├── assignedBy (staff UUID)
├── isPrimary (boolean)
├── createdAt

-- Applicant's current workflow stage
applicant_workflow
├── id (UUID)
├── organizationId (UUID)
├── applicantId (UUID) → applicant.id (UNIQUE)
├── currentStageId (UUID) → workflow_stage.id
├── createdAt

-- History of stage changes (immutable audit trail)
workflow_history
├── id (UUID)
├── organizationId (UUID)
├── applicantId (UUID) → applicant.id
├── fromStageId (UUID, nullable) → workflow_stage.id
├── toStageId (UUID) → workflow_stage.id
├── changedBy (staff UUID)
├── comment
├── createdAt

-- Applicant activity log (immutable)
applicant_activity
├── id (UUID)
├── organizationId (UUID)
├── applicantId (UUID) → applicant.id
├── actorId (UUID, nullable)
├── type (e.g., "applicant.created", "portal_invitation_sent")
├── title
├── description
├── createdAt

-- Portal account (one per applicant)
portal_account
├── id (UUID)
├── organizationId (UUID)
├── applicantId (UUID) → applicant.id (UNIQUE)
├── email
├── passwordHash (NULL until activated)
├── status (pending, active, inactive)
├── activatedAt (NULL until activated)
├── mustChangePass (boolean)
├── createdAt
├── updatedAt

-- Invitation tokens (can have multiple per applicant)
applicant_invitation
├── id (UUID)
├── organizationId (UUID)
├── applicantId (UUID) → applicant.id
├── portalAccountId (UUID) → portal_account.id
├── tokenHash (secure hash of token, not the token itself)
├── expiresAt
├── acceptedAt (NULL until activated)
├── revokedAt (NULL unless staff revoked)
├── createdBy (staff UUID)
├── createdAt
```

### State Transitions

```
Applicant Creation:
  applicant: NULL → CREATED (status=active)
  portal_account: NULL → CREATED (status=pending)
  applicant_workflow: NULL → CREATED (stage=default)
  applicant_activity: NULL → CREATED (type=applicant.created)

Invitation Sent:
  applicant_invitation: NULL → CREATED (expiresAt=now+7d, tokenHash=hash)
  applicant_activity: NULL → CREATED (type=portal_invitation_sent)

Applicant Clicks Link:
  (No DB change, just validation)

Applicant Activates Account:
  portal_account: (passwordHash=NULL) → (passwordHash=argon2hash)
  portal_account: (status=pending) → (status=active)
  portal_account: (activatedAt=NULL) → (activatedAt=now)
  applicant_invitation: (acceptedAt=NULL) → (acceptedAt=now)
  applicant_activity: NULL → CREATED (type=portal_invitation_accepted)
```

---

## Troubleshooting

### Email Not Received

**Check Mailpit (dev):**

```bash
# Open Mailpit web UI
http://localhost:1025

# Check console logs
docker logs mailpit
```

**Check Notification Service:**

- Ensure `NotificationService` is injected in the module
- Check if notification is set to off/disabled in settings

**Check Email Provider Config:**

- If using AWS SES, check credentials in `.env`
- If using SendGrid, check API key

**Restart the app:**

```bash
pnpm dev
```

---

### Token Expired or Invalid

**Reasons:**

1. More than 7 days have passed since invitation was sent
2. Token was already used (account already activated)
3. Token was revoked by staff
4. Token was corrupted or mistyped

**Solution:**

- Staff must resend invitation:
  ```bash
  POST /api/v1/applicants/{applicantId}/invitation/resend
  ```
- A new token is generated, old one is revoked
- New email is sent to applicant

---

### Account Already Activated Error

**Reason:**

- Same token used twice
- Applicant already clicked activation link and set password

**Solution:**

- Applicant can log in with their email + password
- If they forgot password, use "Change Password" endpoint:
  ```bash
  POST /api/v1/applicant-auth/change-password
  Authorization: Bearer <applicant-access-token>

  {
    "oldPassword": "SecurePass@123",
    "newPassword": "NewPass@456!"
  }
  ```
- Or staff can revoke invitation and resend:
  ```bash
  POST /api/v1/applicants/{applicantId}/invitation/revoke
  POST /api/v1/applicants/{applicantId}/invitation
  ```

---

### Password Validation Failed

**Error Message:**

```
Password must be at least 8 characters and contain uppercase, lowercase, number, and special character
```

**Examples of valid passwords:**

- `SecurePass@123`
- `MyP@ssw0rd!`
- `ApplicantTest@2024`
- `PortalAccess#999`

**Examples of invalid passwords:**

- `password` (lowercase only)
- `PASSWORD123` (no special char)
- `Pass@12` (only 7 chars)
- `12345678` (no letters or special char)

---

### Applicant Can't Log In

**Check:**

1. Email is correct
2. Password is correct (case-sensitive)
3. Portal account status is `active` (not `pending`)
4. Account has been activated (`activatedAt` is not NULL)

**Query to verify:**

```sql
SELECT
  pa.email,
  pa.status,
  pa.activatedAt,
  pa.passwordHash IS NOT NULL as has_password
FROM portal_account pa
WHERE pa.email = 'aarav.sharma@example.com';
```

**Output should be:**

```
email                    | status | activatedAt         | has_password
aarav.sharma@example.com | active | 2026-07-06 14:30:00 | true
```

If `status=pending` or `activatedAt=NULL`:

- Applicant hasn't activated yet
- Send/resend invitation

If `has_password=false`:

- Password was never set
- Send invitation again

---

### Multiple Invitations Sent

**Reason:**

- Staff clicked "Send" multiple times
- Or resent invitation before first one expired

**Backend Prevents:**

- Cannot send invitation if one is already active and not expired
- Can only resend if one exists (revokes old, creates new)

**Manual Fix (if needed):**

```sql
-- Revoke all active invitations for an applicant
UPDATE applicant_invitation
SET revoked_at = NOW()
WHERE applicant_id = 'applicant-uuid'
  AND revoked_at IS NULL
  AND accepted_at IS NULL;

-- Then send new invitation via API
POST /api/v1/applicants/{applicantId}/invitation
```

---

### Audit Trail & Activity Log

All applicant-related actions are logged:

```sql
SELECT * FROM applicant_activity
WHERE applicant_id = 'aarav-applicant-uuid'
ORDER BY created_at DESC;

-- Results:
type                           | title                    | created_at
applicant.created              | Applicant created        | 2026-07-06 12:00:00
portal_invitation_sent         | Portal invitation sent   | 2026-07-06 13:30:00
portal_invitation_accepted     | Portal account activated | 2026-07-06 14:30:00
```

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICANT ONBOARDING FLOW                  │
└─────────────────────────────────────────────────────────────────┘

STEP 1: STAFF LOGIN
  │
  ├─ Go to http://localhost:3000
  ├─ Email: admin@example.com
  ├─ Password: NewPass@1234!
  └─ [Logged In] ✓

STEP 2: CREATE APPLICANT
  │
  ├─ Click: Applicants → New Applicant
  ├─ Fill form (name, email, assign staff)
  ├─ Backend Transaction:
  │   ├─ Create applicant record
  │   ├─ Create staff assignment
  │   ├─ Auto-assign default workflow stage
  │   ├─ Create workflow history (audit)
  │   ├─ Link document requirements
  │   ├─ Create activity log entry
  │   └─ Create portal account (status=pending)
  └─ [Applicant Created] ✓

STEP 3: SEND INVITATION
  │
  ├─ On applicant detail page
  ├─ Click: "Send Invitation" button
  ├─ Backend:
  │   ├─ Generate secure token (crypto.randomBytes)
  │   ├─ Hash token (SHA256)
  │   ├─ Create invitation record (store hash only)
  │   ├─ Send email with activation link
  │   └─ Log audit event
  └─ [Invitation Sent] ✓

STEP 4: APPLICANT RECEIVES EMAIL
  │
  ├─ Email arrives in Mailpit (dev) or real email (prod)
  ├─ Subject: "Your Portal Account Invitation"
  ├─ Body includes activation link:
  │   http://localhost:3000/applicant/activate?token=<raw-token>
  └─ [Email Received] ✓

STEP 5: APPLICANT CLICKS LINK
  │
  ├─ Visits http://localhost:3000/applicant/activate?token=...
  ├─ Frontend validates token:
  │   ├─ Extracts token from URL
  │   ├─ Calls GET /api/v1/applicant/activate?token=...
  │   ├─ Backend hashes token and looks up record
  │   ├─ Checks: not revoked, not expired, not already used
  │   └─ Returns validation result
  ├─ If valid → Shows password form
  ├─ If invalid/expired → Shows error message
  └─ [Token Validated] ✓

STEP 6: APPLICANT SETS PASSWORD
  │
  ├─ Frontend shows form:
  │   ├─ Password field with requirements
  │   ├─ Must have: uppercase, lowercase, number, special char, 8+ chars
  │   └─ Confirm password field
  ├─ Applicant enters password (e.g., SecurePass@123)
  ├─ Frontend validates locally
  └─ [Password Entered] ✓

STEP 7: APPLICANT SUBMITS ACTIVATION
  │
  ├─ Clicks "Activate Account" button
  ├─ Frontend calls:
  │   POST /api/v1/applicant/activate
  │   { token: "...", password: "SecurePass@123" }
  ├─ Backend:
  │   ├─ Re-hash token and find invitation
  │   ├─ Validate state (not revoked, not expired, not used)
  │   ├─ Hash password with Argon2
  │   ├─ Update portal_account:
  │   │   ├─ passwordHash = argon2(password)
  │   │   ├─ status = 'active'
  │   │   └─ activatedAt = NOW()
  │   ├─ Mark invitation as accepted
  │   ├─ Revoke other pending invitations
  │   ├─ Revoke portal sessions
  │   └─ Log audit + activity
  └─ [Account Activated] ✓

STEP 8: SUCCESS PAGE
  │
  ├─ Frontend shows "✓ Success! Redirecting to login..."
  ├─ Auto-redirects to http://localhost:3000/applicant/login (after 3s)
  └─ [Redirected] ✓

STEP 9: APPLICANT LOGS IN
  │
  ├─ Email: aarav.sharma@example.com
  ├─ Password: SecurePass@123 (just set)
  ├─ Backend:
  │   ├─ Find portal account by email
  │   ├─ Verify password with Argon2
  │   ├─ Generate JWT access token (15 min)
  │   ├─ Generate JWT refresh token (7 days)
  │   └─ Set HttpOnly cookies
  └─ [Logged In] ✓

STEP 10: PORTAL ACCESS
  │
  ├─ Applicant dashboard shows:
  │   ├─ Profile card (name, applicant number, status)
  │   ├─ Document list (pending, completed, rejected)
  │   ├─ Workflow status (current stage in workflow)
  │   ├─ Upload area (submit documents)
  │   └─ Activity timeline
  ├─ Applicant can:
  │   ├─ View their documents
  │   ├─ Download approved documents
  │   ├─ Upload new documents
  │   ├─ View workflow progress
  │   └─ Change password
  └─ [Portal Active] ✓
```

---

## Summary

The complete applicant workflow is:

1. **Staff creates applicant** (atomic transaction, all data initialized)
2. **Staff sends invitation** (secure token generated, email sent)
3. **Applicant receives email** (activation link + 7-day expiry)
4. **Applicant clicks link** (token validated, password form shown)
5. **Applicant sets password** (Argon2 hashed, account activated)
6. **Applicant logs in** (JWT tokens issued, portal accessible)

**Key Security Features:**

- One-time use tokens (only hash stored, token never repeated)
- Strong password requirements (upper, lower, number, special char, 8+ chars)
- Argon2 password hashing (industry standard, resistant to GPU attacks)
- HTTP-only secure cookies (tokens never exposed to JavaScript)
- 7-day token expiry (forces timely activation)
- Staff can revoke invitations (security control)
- Audit trail (all actions logged)
- Activity timeline (applicant can see their history)

---

## File Locations for Reference

| Component                     | Path                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| **Applicant Create**          | `apps/api/src/modules/applicant/`                                                    |
| **Applicant Service**         | `apps/api/src/modules/applicant/services/applicant.service.ts`                       |
| **Invitation Service**        | `apps/api/src/modules/applicant-invitation/services/applicant-invitation.service.ts` |
| **Applicant Auth**            | `apps/api/src/modules/applicant-auth/`                                               |
| **Frontend: Create Form**     | `apps/web/src/features/applicants/components/ApplicantForm.tsx`                      |
| **Frontend: Invitation UI**   | `apps/web/src/features/applicant-invitation/components/`                             |
| **Frontend: Activation Page** | `apps/web/src/app/(applicant-portal)/applicant/activate/page.tsx`                    |
| **Seed Data**                 | `prisma/seed.ts` (lines 204–357)                                                     |
| **Database Schema**           | `prisma/schema.prisma`                                                               |
