# 🚀 Quick Start Guide — Testing Applicant Invitations

## 1️⃣ Open Mailpit Web UI

```
http://localhost:8025
```

This is where you'll see all emails sent by the system.

---

## 2️⃣ Login to Staff Dashboard

```
http://localhost:3000
Email: admin@example.com
Password: NewPass@1234!
```

---

## 3️⃣ Send Invitation to Applicant

```
Dashboard → Applicants → Aarav Sharma → Send Invitation
```

You'll see confirmation: "Invitation sent"

---

## 4️⃣ Check Email in Mailpit

```
Go to http://localhost:8025
You should see 1 new email:
  Subject: Your Portal Account Invitation
  From: noreply@system.local
  To: aarav.sharma@example.com
```

Click the email to open it.

---

## 5️⃣ Copy Activation Link

In the email, find the link that looks like:

```
https://localhost:3000/applicant/activate?token=a3f2b1c9d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

**Copy the entire URL** (including the token).

---

## 6️⃣ Activate Account

```
1. Paste the link in your browser address bar
2. Press Enter
3. Wait for page to load (it validates the token)
4. You should see: "Activate Your Account" form
```

---

## 7️⃣ Set Password

```
Password field: Enter SecurePass@123

Requirements (all must be met):
  ✓ Uppercase letter (A-Z)
  ✓ Lowercase letter (a-z)
  ✓ Number (0-9)
  ✓ Special character (!@#$%^&*)
  ✓ At least 8 characters

Confirm Password field: Enter SecurePass@123

Click: Activate Account
```

---

## 8️⃣ Success!

```
You should see:
"✓ Your account has been activated successfully!"

Then it auto-redirects to login page (after 3 seconds).
```

---

## 9️⃣ Login as Applicant

```
URL: http://localhost:3000/applicant/login
Email: aarav.sharma@example.com
Password: SecurePass@123

Click: Login
```

---

## 🔟 Portal Access

```
You're now in the applicant portal! 🎉

You can see:
  • Your profile (name, applicant number)
  • Your documents (pending, completed, rejected)
  • Your workflow status (current stage)
  • Activity timeline
  • Upload area (submit documents)
```

---

## 📧 Email Examples

### **Valid Passwords:**

- `SecurePass@123`
- `MyP@ssw0rd!`
- `ApplicantTest@2024`
- `PortalAccess#999`

### **Invalid Passwords:**

- `password` ❌ (no uppercase, number, special char)
- `Pass@12` ❌ (only 7 chars, needs 8+)
- `PASSWORD123!` ❌ (no lowercase)
- `12345678` ❌ (no letters or special char)

---

## 🔗 URLs Reference

| URL                                                  | Purpose                      |
| ---------------------------------------------------- | ---------------------------- |
| `http://localhost:3000`                              | Staff dashboard              |
| `http://localhost:3000/applicant/login`              | Applicant login              |
| `http://localhost:3000/applicant/activate?token=...` | Activation link (from email) |
| `http://localhost:8025`                              | Mailpit email viewer         |

---

## 🐛 Something Not Working?

### **No email in Mailpit?**

```bash
# Restart the app
# Kill: Ctrl+C (in terminal running pnpm dev)
# Start: pnpm dev
```

### **Activation link doesn't work?**

```bash
# Make sure token is complete (very long string)
# Check you copied entire URL from email
# Try again in 10 seconds
```

### **Can't login as applicant?**

```bash
# Check email and password are correct
# Make sure you completed activation
# Try resending invitation from staff dashboard
```

---

## 📋 Checklist

- [ ] Mailpit open: http://localhost:8025
- [ ] Staff dashboard open: http://localhost:3000
- [ ] Logged in as admin
- [ ] Sent invitation to applicant
- [ ] Email appears in Mailpit
- [ ] Copied activation link
- [ ] Clicked link in browser
- [ ] Set password (meets requirements)
- [ ] Clicked "Activate Account"
- [ ] Saw success message
- [ ] Logged in as applicant
- [ ] Accessing applicant portal ✅

---

## 🎯 Next Steps

After testing the flow:

1. **Create Your Own Applicant**
   - Dashboard → Applicants → New Applicant
   - Fill in details
   - Choose staff to assign
   - Create

2. **Send Invitation**
   - Click applicant
   - Send Invitation button
   - Check Mailpit for email

3. **Test Different Scenarios**
   - Multiple invitations
   - Resend invitation
   - Revoke invitation
   - Token expiry (wait 7 days or modify DB)

4. **Upload Documents**
   - Login as applicant
   - Documents tab
   - Upload files

---

## 💡 Tips

- **Mailpit clears on restart** — if you restart Docker, emails are gone
- **Tokens expire in 7 days** — but you can resend immediately
- **Passwords are hashed with Argon2** — very secure
- **All emails go through Mailpit locally** — no real emails sent
- **Emails in production** — configure real SMTP provider in .env

---

## 🆘 Common Errors

| Error                      | Fix                                               |
| -------------------------- | ------------------------------------------------- |
| "Invalid activation link"  | Copy entire URL including token                   |
| "Token expired"            | 7 days passed or already used. Resend invitation. |
| "Password must contain..." | Add uppercase, lowercase, number, special char    |
| "Already activated"        | Account was already activated. Try login instead. |
| "Connection refused"       | Check Mailpit is running: `docker ps`             |

---

## ✅ You're Ready!

Everything is set up. Follow the 10 steps above to test the complete workflow.

**Happy testing!** 🚀
