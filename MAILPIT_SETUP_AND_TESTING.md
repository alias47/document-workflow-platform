# Mailpit Setup & Email Testing Guide

## ✅ Setup Complete!

Mailpit is now installed and running in your Docker environment. Here's how to use it.

---

## Quick Start

### **1. Check Containers Are Running**

```bash
docker ps --filter "name=document_workflow" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

You should see:

```
NAMES                        STATUS              PORTS
document_workflow_mailpit    Up 2 seconds        0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp
document_workflow_postgres   Up 18 minutes       0.0.0.0:5432->5432/tcp
```

### **2. Start the App**

```bash
# Terminal 1
pnpm dev
```

The app will start on:

- **API:** `http://localhost:3001/api/v1`
- **Frontend:** `http://localhost:3000`
- **Mailpit:** `http://localhost:8025`

### **3. Open Mailpit Web UI**

```
http://localhost:8025
```

You'll see the email inbox (empty until you send emails).

---

## Testing Email Flow (End-to-End)

Follow these exact steps to test the complete applicant invitation → activation flow.

### **Step 1: Login as Staff**

1. Open: `http://localhost:3000`
2. Email: `admin@example.com`
3. Password: `NewPass@1234!`
4. Click **Login**

✅ You're now on the staff dashboard

### **Step 2: Go to Applicants**

1. Click **Applicants** in the sidebar
2. You'll see 3 pre-seeded applicants:
   - Aarav Sharma
   - Mei Ling Chen
   - Daniel Okeke

### **Step 3: Send Invitation to Aarav**

1. Click on **"Aarav Sharma"**
2. Scroll down to **Portal Account** section
3. Click **"Send Invitation"**
4. You should see: ✅ "Invitation sent successfully"

### **Step 4: Check Mailpit for the Email**

1. Open new tab: `http://localhost:8025`
2. You should see **1 email** in the inbox
3. Subject: `Your Portal Account Invitation`
4. From: `noreply@system.local`
5. To: `aarav.sharma@example.com`

**Click the email to view details:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject: Your Portal Account Invitation

From: noreply@system.local
To: aarav.sharma@example.com
Date: [Current time]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello Aarav Sharma,

You've been invited to access your portal for Default Organization.

Click the link below to activate your account and set your password:

https://localhost:3000/applicant/activate?token=a3f2b1c9d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0

This link will expire in 7 days.

If you didn't expect this invitation, please ignore this email.

Best regards,
Default Organization

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **Step 5: Copy the Activation Link**

In Mailpit, find the link that starts with:

```
https://localhost:3000/applicant/activate?token=
```

**Copy the entire URL** (it's a long token string).

### **Step 6: Open Activation Link in Browser**

1. Paste the link in your browser address bar
2. Press Enter
3. Wait for the page to load (it validates the token)
4. You should see the activation form:

```
┌─────────────────────────────────────────────────────┐
│  Activate Your Account                              │
├─────────────────────────────────────────────────────┤
│  Welcome, Aarav Sharma                              │
│  Default Organization                              │
│                                                     │
│  Set Your Password                                  │
│  ┌──────────────────────────────────────────────┐  │
│  │ Password: [••••••••••••]                     │  │
│  └──────────────────────────────────────────────┘  │
│  ✓ Uppercase letter (A-Z)                          │
│  ✓ Lowercase letter (a-z)                          │
│  ✓ Number (0-9)                                    │
│  ✓ Special character (!@#$%^&*)                    │
│  ✓ At least 8 characters                           │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Confirm Password: [••••••••••••]             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  [ Activate Account ]  [ Cancel ]                  │
└─────────────────────────────────────────────────────┘
```

### **Step 7: Set Password**

1. Enter a valid password (must meet all requirements):
   - **Example:** `SecurePass@123`
   - **Example:** `ApplicantTest@2024`
   - **Example:** `PortalAccess#999`

2. Confirm the password in the second field

3. Click **"Activate Account"**

4. You should see: ✅ **"Your account has been activated successfully"**

5. Auto-redirects to login page (after 3 seconds)

### **Step 8: Login to Portal**

1. You're now on: `http://localhost:3000/applicant/login`
2. Email: `aarav.sharma@example.com`
3. Password: `SecurePass@123` (what you just set)
4. Click **"Login"**

✅ **You're now in the applicant portal!**

You should see:

- Applicant profile card (name, applicant number)
- Documents section
- Workflow status card
- Activity timeline

---

## Mailpit Features

### **View Email HTML**

Click on any email → Click **HTML** tab to see formatted version

### **View Email Plain Text**

Click on any email → Click **Plain Text** tab for raw text

### **View Email Headers**

Click on any email → Click **Raw** tab for SMTP headers (debugging)

### **Search Emails**

Use the search box at top:

```
Search: aarav.sharma@example.com
```

### **Delete Email**

Click email → Click **Trash** icon to delete

### **Delete All Emails**

Top bar → Click **Delete All** button (use carefully!)

### **Download Email**

Click email → Click **Download** to save as `.eml` file

---

## Resend Invitation (Testing Multiple Flows)

If you want to test sending another invitation:

1. Go back to staff dashboard
2. Click applicant "Mei Ling Chen"
3. Scroll to "Portal Account"
4. Click "Send Invitation"
5. Check Mailpit for email to `mei.chen@example.com`
6. Copy activation link
7. Paste in browser
8. Follow same steps as above

---

## Common Testing Scenarios

### **Scenario 1: Token Expired**

1. Send invitation to applicant
2. Wait 7 days (or manually update database)
3. Try to use old activation link
4. **Result:** "This link has expired. Please contact your consultant."

### **Scenario 2: Token Already Used**

1. Send invitation, get link, activate account
2. Try to click same link again
3. **Result:** "This account has already been activated."

### **Scenario 3: Resend Invitation**

1. Send invitation to applicant
2. Applicant doesn't activate yet
3. Staff clicks "Resend Invitation"
4. New email sent (old token revoked)
5. Activate with new link
6. **Result:** ✅ Works

### **Scenario 4: Revoke Invitation**

1. Send invitation to applicant
2. Staff clicks "Revoke Invitation"
3. Try to use old activation link
4. **Result:** "This invitation has been revoked."

### **Scenario 5: Invalid Password**

1. On activation page, try invalid password:
   - `password` (no uppercase, number, special char)
   - `Pass@12` (only 7 chars)
   - `PASSWORD123!` (no lowercase)
2. **Result:** Error message with requirements

---

## Mailpit Docker Container Info

```bash
# View Mailpit logs
docker logs document_workflow_mailpit

# Restart Mailpit
docker restart document_workflow_mailpit

# Stop Mailpit
docker stop document_workflow_mailpit

# Start Mailpit
docker start document_workflow_mailpit

# Remove Mailpit (careful!)
docker rm document_workflow_mailpit
```

---

## Environment Configuration

Your `.env` file now has SMTP settings:

```bash
# Email / SMTP (Mailpit for development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@system.local
SMTP_USE_TLS=false
```

**For production**, change these to real email provider:

- **AWS SES:** `SMTP_HOST=email-smtp.us-east-1.amazonaws.com`
- **SendGrid:** `SMTP_HOST=smtp.sendgrid.net`
- **Gmail:** `SMTP_HOST=smtp.gmail.com` (requires app-specific password)

---

## Troubleshooting

### **Mailpit Web UI won't load (localhost:8025)**

```bash
# Check if container is running
docker ps | grep mailpit

# If not running, restart it
docker-compose -f docker/docker-compose.yml restart mailpit

# Check logs
docker logs document_workflow_mailpit
```

### **Email not appearing in Mailpit**

1. **Check API logs for errors:**

   ```bash
   pnpm dev
   # Look for "Notification sent" or error messages
   ```

2. **Verify SMTP config in .env:**

   ```bash
   cat .env | grep SMTP_
   # Should show:
   # SMTP_HOST=localhost
   # SMTP_PORT=1025
   ```

3. **Restart API:**

   ```bash
   # Kill pnpm dev (Ctrl+C)
   # Run again: pnpm dev
   ```

4. **Check Mailpit logs:**
   ```bash
   docker logs document_workflow_mailpit
   # Should show: "Listening on 0.0.0.0:1025"
   ```

### **"Connection refused" when sending email**

1. **Make sure Mailpit is running:**

   ```bash
   docker ps | grep mailpit
   ```

2. **Check port 1025 is open:**

   ```bash
   netstat -an | grep 1025
   # Should show something listening on 1025
   ```

3. **Restart containers:**
   ```bash
   docker-compose -f docker/docker-compose.yml restart
   ```

### **Email sent but token link is wrong**

Check the `APP_URL` in your config. Token should match:

```
http://localhost:3000/applicant/activate?token=...
```

If it shows wrong domain, update your app config.

---

## Testing Checklist

- [ ] Mailpit running (`docker ps`)
- [ ] Database running (`docker ps`)
- [ ] App running (`pnpm dev`)
- [ ] Login to staff dashboard
- [ ] Send invitation to applicant
- [ ] See email in Mailpit
- [ ] Copy activation link
- [ ] Click link in browser
- [ ] Set password (meets requirements)
- [ ] See success message
- [ ] Auto-redirect to login
- [ ] Login with applicant credentials
- [ ] Access applicant portal ✅

---

## Quick Reference

| Task                     | Steps                                                 |
| ------------------------ | ----------------------------------------------------- |
| **Open Mailpit**         | `http://localhost:8025`                               |
| **View email**           | Click email in Mailpit inbox                          |
| **Copy activation link** | Email → Copy entire URL with token                    |
| **Test activation**      | Paste link in browser → Set password → Click activate |
| **Login to portal**      | Go to `/applicant/login` → Email + password           |
| **Resend invitation**    | Staff dashboard → Applicant → "Resend Invitation"     |
| **Revoke invitation**    | Staff dashboard → Applicant → "Revoke Invitation"     |
| **Clear emails**         | Mailpit → "Delete All" button                         |
| **View logs**            | Terminal with `pnpm dev` running                      |
| **Restart Mailpit**      | `docker restart document_workflow_mailpit`            |

---

## Next Steps

1. ✅ Mailpit is running
2. ✅ App is running
3. ✅ Database is seeded
4. **Now:** Test the complete flow above
5. **Then:** Check admin portal to see activity logs
6. **Finally:** Create your own applicants and test the full workflow

Happy testing! 🎉
