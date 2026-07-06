# Applicant Portal Credentials & Access Guide

## Yes, There Is an Applicant Portal! 🎉

The document-workflow-platform includes a fully functional **applicant portal** for self-service access to documents and workflow status.

---

## Test Credentials (From Seed Data)

### Seeded Applicants

Three test applicants have been pre-created in the seed data with portal accounts:

#### 1. Aarav Sharma

- **Email:** aarav.sharma@example.com
- **Applicant Number:** APP-2026-0001
- **Portal Account Status:** Pending (awaiting invitation from staff)
- **Phone:** +977-9800000001
- **Country:** Nepal

#### 2. Mei Ling Chen

- **Email:** mei.chen@example.com
- **Applicant Number:** APP-2026-0002
- **Portal Account Status:** Pending (awaiting invitation from staff)
- **Phone:** +86-13800000002
- **Country:** China

#### 3. Daniel Okeke

- **Email:** daniel.okeke@example.com
- **Applicant Number:** APP-2026-0003
- **Portal Account Status:** Pending (awaiting invitation from staff)
- **Phone:** +234-8030000003
- **Country:** Nigeria

---

## How to Get Applicant Credentials

### Option 1: Staff-Driven Onboarding (Recommended - As Designed)

This follows the **consultant-driven onboarding** model described in the architecture:

**Steps:**

1. **Staff Login** to the main dashboard
   - Email: `admin@example.com`
   - Password: `NewPass@1234!` (or `$SEED_ADMIN_PASSWORD` env var)

2. **Send Invitation to Applicant**
   - Navigate to the applicant record
   - Click "Send Portal Invitation"
   - System generates a unique token and email invitation

3. **Applicant Receives Email**
   - Activation link is one-time use
   - Link expires after 7 days
   - Applicant clicks link and sets their password

4. **Applicant Logs In**
   - Email: applicant's registered email (e.g., `aarav.sharma@example.com`)
   - Password: Set by applicant during activation (no default)
   - Portal access: Personal documents, workflow status, upload area

---

### Option 2: Generate Activation Token Manually (Testing)

If you want to bypass the email for testing, manually activate an applicant account:

**API Call:**

```bash
POST /api/v1/applicant-invitation/activate
Content-Type: application/json

{
  "token": "<activation-token-from-db>",
  "newPassword": "SecureTest@123!"
}
```

**Backend Flow:**

1. Query the `applicant_invitation` table for a `portalAccountId`
2. Use the raw token from that record
3. Call the activate endpoint with your test password
4. Portal account is now active

---

## Portal Access Points

### Frontend Routes

- **Applicant Portal:** `http://localhost:3000/applicant` (requires login)
- **Activation Page:** `http://localhost:3000/applicant/activate?token=<token>`

### API Endpoints (Applicant)

- `POST /api/v1/applicant-auth/login` — Login
- `POST /api/v1/applicant-auth/logout` — Logout
- `GET /api/v1/applicant-auth/me` — Current profile
- `POST /api/v1/applicant-auth/change-password` — Change password
- `POST /api/v1/applicant-auth/refresh` — Refresh token

### API Endpoints (Staff Manages Invitations)

- `POST /api/v1/applicant-invitation` — Send new invitation
- `POST /api/v1/applicant-invitation/resend/:id` — Resend expired invitation
- `DELETE /api/v1/applicant-invitation/:id` — Revoke invitation
- `GET /api/v1/applicant-invitation/:applicantId` — Check invitation status

---

## Architecture Notes

✓ **Consultant-driven onboarding:** Applicants don't self-register; staff creates them and invites them.  
✓ **One-time activation tokens:** Secure, time-limited (7 days), used once to set password.  
✓ **Argon2 password hashing:** Industry-standard, implemented via `PasswordService`.  
✓ **HTTP-only cookies:** Access/refresh tokens stored securely in browser cookies (not localStorage).  
✓ **JWT auth:** Separate `applicant-auth` module from staff auth.  
✓ **Organization isolation:** All portal accounts scoped to organization.

---

## Quick Start for Testing

### 1. Start the app

```bash
pnpm dev
```

### 2. Seed the database

```bash
pnpm --filter @repo/api db:seed
```

### 3. Login as staff

- Navigate to `http://localhost:3000` → Dashboard
- Email: `admin@example.com`
- Password: `NewPass@1234!`

### 4. Send invitation to first applicant

- Go to Applicants → select "Aarav Sharma"
- Click "Send Portal Invitation"

### 5. Check your email / notification

- In dev mode, emails go to **Mailpit** (`http://localhost:1025`)
- Click the activation link

### 6. Set applicant password

- Portal prompts for new password
- Example: `ApplicantTest@123!`

### 7. Login to portal

- Go to `http://localhost:3000/applicant`
- Email: `aarav.sharma@example.com`
- Password: (whatever you just set)

---

## Common Commands

### View seeded data

```bash
pnpm --filter @repo/api db:studio
```

Open Prisma Studio, navigate to `PortalAccount` and `ApplicantInvitation` tables.

### Check invitation tokens (for manual testing)

```sql
SELECT id, token_hash, expires_at, revoked_at, accepted_at
FROM applicant_invitation
ORDER BY created_at DESC
LIMIT 5;
```

### Reset an applicant's portal status

```sql
DELETE FROM applicant_invitation WHERE applicant_id = '<applicant-id>';
UPDATE portal_account SET status = 'pending', activated_at = NULL WHERE applicant_id = '<applicant-id>';
```

---

## Files to Reference

- **Backend Auth:** `apps/api/src/modules/applicant-auth/`
- **Invitations:** `apps/api/src/modules/applicant-invitation/`
- **Portal UI:** `apps/web/src/features/applicant-portal/`
- **Seed Script:** `prisma/seed.ts`
- **Seed Data:** Lines 204–357 (sample applicants with portal accounts)

---

## Still Have Questions?

- Check the **CLAUDE.md** "Consultant-driven onboarding" section (§2, §10)
- Read `docs/02_SYSTEM_ARCHITECTURE.md` for design principles
- Trace the flow: `applicant-auth` → `applicant-invitation` → `applicant-portal` feature
