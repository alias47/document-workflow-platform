# Applicant Portal & Email Testing — Complete Documentation

## 📚 Documentation Files

I've created **5 comprehensive guides** for you:

### **1. QUICK_START.md** ⭐ START HERE

- 10-step testing flow (5 minutes)
- Simple copy-paste instructions
- Common errors & fixes
- Password examples
- Best for: Getting started quickly

### **2. MAILPIT_SETUP_AND_TESTING.md**

- Detailed Mailpit features
- Complete testing scenarios
- Troubleshooting guide
- Docker commands
- Email configuration for production
- Best for: Understanding how emails work

### **3. COMPLETE_APPLICANT_WORKFLOW.md**

- Full architectural explanation
- All 10 integration steps with code
- API endpoints reference
- Database schema & state transitions
- Security features explained
- Best for: Understanding the system deeply

### **4. APPLICANT_PORTAL_CREDENTIALS.md**

- Pre-seeded test credentials
- How consultant-driven onboarding works
- Portal access points
- Manual token generation
- Best for: Quick credential reference

### **5. SETUP_SUMMARY.md**

- What was installed & configured
- Environment changes
- Docker services status
- Production email configuration
- Best for: Understanding what was set up

---

## ✅ What I Set Up

### **Mailpit Installation**

- ✅ Added to `docker/docker-compose.yml`
- ✅ Configured SMTP: `localhost:1025`
- ✅ Web UI: `http://localhost:8025`
- ✅ Running & healthy

### **SMTP Configuration**

- ✅ Updated `.env` with SMTP settings
- ✅ Host: `localhost`
- ✅ Port: `1025`
- ✅ No auth required (development)
- ✅ From: `noreply@system.local`

### **Database & App**

- ✅ PostgreSQL running (was already running)
- ✅ Database seeded with test data
- ✅ Admin account: `admin@example.com` / `NewPass@1234!`
- ✅ 3 pre-seeded applicants ready for testing
- ✅ App ready to run

---

## 🚀 Get Started in 5 Minutes

### **Step 1: Start the app**

```bash
pnpm dev
```

### **Step 2: Open these URLs**

- Staff Dashboard: `http://localhost:3000`
- Mailpit: `http://localhost:8025`

### **Step 3: Follow QUICK_START.md**

The 10-step guide walks you through:

- Login as staff
- Send invitation
- Check email
- Activate account
- Login as applicant

**That's it!** 🎉

---

## 📖 Complete Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  APPLICANT ONBOARDING FLOW (10 Steps)                       │
└─────────────────────────────────────────────────────────────┘

1. STAFF LOGIN
   → admin@example.com / NewPass@1234!

2. CREATE APPLICANT
   → Automatically initializes:
     • Portal account (pending)
     • Workflow stage (default)
     • Document requirements
     • Activity log

3. SEND INVITATION
   → System generates:
     • Secure one-time token
     • Email with activation link
     • 7-day expiry
     • Audit log entry

4. APPLICANT RECEIVES EMAIL
   → Email captured by Mailpit
     • Link: http://localhost:3000/applicant/activate?token=...
     • Can be viewed at http://localhost:8025

5. APPLICANT CLICKS LINK
   → Frontend validates:
     • Token is valid
     • Not revoked
     • Not expired
     • Not already used

6. APPLICANT SETS PASSWORD
   → Requirements:
     • Uppercase letter
     • Lowercase letter
     • Number
     • Special character
     • At least 8 characters

7. APPLICANT SUBMITS ACTIVATION
   → Backend:
     • Hashes password (Argon2)
     • Marks account as active
     • Invalidates token
     • Revokes other invitations

8. SUCCESS PAGE
   → Shows confirmation
     • Auto-redirects to login

9. APPLICANT LOGS IN
   → Uses email + password
     • JWT tokens issued
     • HttpOnly cookies set
     • Access to portal

10. PORTAL ACCESS
    → Applicant can:
     • View profile
     • See documents
     • Check workflow status
     • Upload files
     • View activity
```

---

## 🔐 Security Features

✅ **One-time use tokens** — Token invalidated after first use  
✅ **Secure hashing** — Tokens hashed SHA256, password hashed Argon2  
✅ **Token expiry** — 7-day limit forces timely activation  
✅ **HTTP-only cookies** — Tokens never exposed to JavaScript  
✅ **Staff control** — Can revoke/resend invitations  
✅ **Audit trail** — All actions logged  
✅ **Strong passwords** — Enforced complexity requirements

---

## 📊 Database Tables

Involved in the workflow:

| Table                  | Purpose           | Records                |
| ---------------------- | ----------------- | ---------------------- |
| `applicant`            | Applicant records | 1 per applicant        |
| `portal_account`       | Login credentials | 1 per applicant        |
| `applicant_invitation` | Token tracking    | Multiple per applicant |
| `applicant_assignment` | Staff assignment  | 1+ per applicant       |
| `applicant_workflow`   | Current stage     | 1 per applicant        |
| `workflow_history`     | Stage history     | Multiple               |
| `applicant_activity`   | Activity log      | Multiple               |
| `document`             | Document records  | Multiple               |

---

## 🧪 Test Data

**Pre-seeded applicants:**

| Name          | Email                    | Applicant #   | Status  |
| ------------- | ------------------------ | ------------- | ------- |
| Aarav Sharma  | aarav.sharma@example.com | APP-2026-0001 | Pending |
| Mei Ling Chen | mei.chen@example.com     | APP-2026-0002 | Pending |
| Daniel Okeke  | daniel.okeke@example.com | APP-2026-0003 | Pending |

All have:

- ✅ Portal account created
- ✅ Assigned to admin staff
- ✅ Default workflow stage assigned
- ✅ Ready to receive invitations

---

## 🔧 Environment Setup

**Files modified:**

1. `docker/docker-compose.yml` — Added Mailpit service
2. `.env` — Added SMTP configuration

**Containers running:**

- ✅ PostgreSQL (database)
- ✅ Mailpit (email capture)
- ✅ Frontend (Next.js, port 3000)
- ✅ API (NestJS, port 3001)

**Test it:**

```bash
docker ps --filter "name=document_workflow"
# Should show mailpit and postgres healthy
```

---

## 📧 How Emails Work (Development)

In development, **Mailpit intercepts all emails** before they leave the system:

```
Application
    ↓
Sends email via SMTP (localhost:1025)
    ↓
Mailpit
    ↓
Stores in memory (viewable at localhost:8025)
    ↓
You can see it!
```

**In production**, change SMTP settings to real provider:

- AWS SES
- SendGrid
- Gmail
- Any SMTP server

---

## 🐛 Troubleshooting

### **Mailpit not showing emails?**

```bash
# Check if running
docker ps | grep mailpit

# Restart
docker restart document_workflow_mailpit

# Check logs
docker logs document_workflow_mailpit
```

### **Activation link doesn't work?**

- Make sure you copied the **entire URL** (including token)
- Token is very long (64+ characters)
- Try again in 10 seconds
- Check browser console for errors (F12)

### **Can't login as applicant?**

- Make sure account was activated
- Email and password must be exact (case-sensitive)
- Try resending invitation from staff dashboard

### **App not starting?**

```bash
# Kill pnpm dev (Ctrl+C)
# Wait 5 seconds
# Run again
pnpm dev
```

---

## 📋 Files in Project

**Backend (API):**

- `apps/api/src/modules/applicant/` — Applicant creation
- `apps/api/src/modules/applicant-invitation/` — Invitation management
- `apps/api/src/modules/applicant-auth/` — Portal authentication
- `apps/api/src/modules/notification/` — Email sending

**Frontend:**

- `apps/web/src/features/applicants/` — Staff applicant management
- `apps/web/src/features/applicant-invitation/` — Invitation UI
- `apps/web/src/features/applicant-portal/` — Applicant dashboard
- `apps/web/src/app/(applicant-portal)/` — Portal routes

**Configuration:**

- `docker/docker-compose.yml` — Docker services
- `.env` — Environment variables
- `prisma/schema.prisma` — Database schema
- `prisma/seed.ts` — Test data

---

## 🎓 Learning Path

1. **Start:** Read `QUICK_START.md` (5 min)
2. **Test:** Follow the 10-step flow manually
3. **Explore:** Check emails in Mailpit
4. **Understand:** Read `COMPLETE_APPLICANT_WORKFLOW.md` (deep dive)
5. **Reference:** Use `MAILPIT_SETUP_AND_TESTING.md` for specific scenarios
6. **Build:** Create your own features using the same patterns

---

## ✨ What You Can Do Now

✅ Create applicants via staff dashboard  
✅ Send portal invitations  
✅ Receive emails (in Mailpit)  
✅ Activate applicant accounts  
✅ Login as applicants  
✅ Access applicant portal  
✅ Test document uploads  
✅ Track workflow progress  
✅ View activity logs  
✅ Test all edge cases

---

## 🚀 Next Steps

1. **Read QUICK_START.md** — Get familiar with the flow
2. **Test the workflow** — Follow all 10 steps
3. **Create test applicants** — Build your own for testing
4. **Explore the portal** — See what applicants can do
5. **Check the code** — Understand the implementation
6. **Customize** — Adapt to your needs

---

## 📞 Support

If something doesn't work:

1. Check the troubleshooting section above
2. Review the relevant documentation file
3. Check Docker container status: `docker ps`
4. Check logs: `docker logs document_workflow_mailpit`
5. Restart containers: `docker-compose -f docker/docker-compose.yml restart`

---

## 🎉 You're All Set!

Everything is installed, configured, and ready to test.

**Next:** Open `QUICK_START.md` and follow the 10 steps to test the complete workflow!
