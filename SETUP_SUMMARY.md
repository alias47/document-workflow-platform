# ✅ Mailpit Setup Complete

## What I Did

I've installed and configured **Mailpit** for your local email testing. Here's what changed:

### **1. Updated docker-compose.yml**

Added Mailpit service:

```yaml
mailpit:
  image: axllent/mailpit:latest
  container_name: document_workflow_mailpit
  ports:
    - '1025:1025' # SMTP port (for sending emails)
    - '8025:8025' # Web UI port (for viewing emails)
```

### **2. Updated .env**

Added SMTP configuration:

```bash
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@system.local
SMTP_USE_TLS=false
```

### **3. Started Containers**

✅ PostgreSQL is running (database)  
✅ Mailpit is running (email capture)  
✅ Database is seeded (admin + 3 applicants)  
✅ App is ready to go

---

## Access Points

| Service              | URL                            | Purpose                   |
| -------------------- | ------------------------------ | ------------------------- |
| **Staff Dashboard**  | `http://localhost:3000`        | Login & manage applicants |
| **API**              | `http://localhost:3001/api/v1` | Backend endpoints         |
| **Mailpit (Emails)** | `http://localhost:8025`        | View captured emails      |

---

## Test Credentials

| Role            | Email                      | Password                |
| --------------- | -------------------------- | ----------------------- |
| **Staff Admin** | `admin@example.com`        | `NewPass@1234!`         |
| **Applicant 1** | `aarav.sharma@example.com` | (Set during activation) |
| **Applicant 2** | `mei.chen@example.com`     | (Set during activation) |
| **Applicant 3** | `daniel.okeke@example.com` | (Set during activation) |

---

## Quick Test (5 Minutes)

### **Step 1: Login as Staff**

```
http://localhost:3000
admin@example.com / NewPass@1234!
```

### **Step 2: Send Invitation**

```
Applicants → Aarav Sharma → Send Invitation
```

### **Step 3: Check Email**

```
http://localhost:8025
Look for email to aarav.sharma@example.com
Click email → Copy activation link
```

### **Step 4: Activate Account**

```
Paste link in browser
Set password: SecurePass@123
Click "Activate Account"
```

### **Step 5: Login as Applicant**

```
http://localhost:3000/applicant/login
aarav.sharma@example.com / SecurePass@123
```

✅ **Done!** You're in the applicant portal.

---

## Docker Commands

```bash
# Check all containers running
docker ps --filter "name=document_workflow"

# View Mailpit logs
docker logs document_workflow_mailpit

# Restart Mailpit
docker restart document_workflow_mailpit

# View mail logs live
docker logs -f document_workflow_mailpit
```

---

## Files Changed

1. **docker/docker-compose.yml** — Added Mailpit service
2. **.env** — Added SMTP configuration

---

## Next: Full Documentation

I've created 3 comprehensive guides in the scratchpad:

1. **COMPLETE_APPLICANT_WORKFLOW.md** — Full end-to-end flow (10 steps)
2. **MAILPIT_SETUP_AND_TESTING.md** — Detailed Mailpit testing guide
3. **APPLICANT_PORTAL_CREDENTIALS.md** — Credentials reference

---

## Verify Everything is Running

Run this command:

```bash
docker ps --filter "name=document_workflow" --format "table {{.Names}}\t{{.Status}}"
```

You should see:

```
NAMES                        STATUS
document_workflow_mailpit    Up (healthy)
document_workflow_postgres   Up (healthy)
```

If you see "Exited", something went wrong. Check logs:

```bash
docker logs document_workflow_mailpit
docker logs document_workflow_postgres
```

---

## Troubleshooting

### Mailpit web UI won't open (localhost:8025)?

```bash
docker restart document_workflow_mailpit
sleep 5
# Try again
```

### No emails appearing?

```bash
# Check app is running (should see "Listening on 3001")
pnpm dev

# Check SMTP config
cat .env | grep SMTP_

# Restart app
# Kill pnpm dev (Ctrl+C)
# Run: pnpm dev
```

### Database errors?

```bash
# Restart database
docker restart document_workflow_postgres

# Re-seed (if needed)
pnpm --filter @repo/api db:seed
```

---

## What You Can Now Do

✅ Create applicants  
✅ Send invitations  
✅ Receive emails (in Mailpit)  
✅ Activate applicant accounts  
✅ Login as applicants  
✅ View applicant portal  
✅ Test document uploads  
✅ Track workflow progress

---

## Production Email Configuration

When ready for production, update `.env`:

**AWS SES:**

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-username
SMTP_PASSWORD=your-ses-password
SMTP_USE_TLS=true
```

**SendGrid:**

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_USE_TLS=true
```

**Gmail:**

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
```

---

## Summary

🎉 **You're all set!**

- Mailpit installed and running ✅
- Database seeded with test data ✅
- App configured for email ✅
- Ready to test applicant workflows ✅

Next step: Open `http://localhost:3000` and start creating applicants!
