# ✅ How to Send Invitation to Applicant

## The "Send Invitation" Button Location

The "Send Invitation" button is **NOT on the main Info tab** — it's in a separate **"Portal" tab**.

---

## Step-by-Step Guide

### 1. Login to Dashboard

```
URL: http://localhost:3000
Email: admin@example.com
Password: NewPass@1234!
```

### 2. Go to Applicants

Click **Applicants** in the sidebar

### 3. Select an Applicant

Click on an applicant name (e.g., "Aarav Sharma")

### 4. Click the "Portal" Tab

On the applicant detail page, you'll see multiple tabs:

- **Info** ← Currently showing personal information
- **Documents** ← Shows required/uploaded documents
- **Notes** ← Add/view notes
- **Activity Log** ← See activity history
- **Portal** ← ⭐ **Click this one!**

### 5. Find "Send Invitation" Button

In the **Portal** tab, you'll see:

- A "Portal Account" card
- An invitation status badge (showing "None" if not invited yet)
- Buttons at the bottom:
  - **"Send Invitation"** ← Click this!
  - Other buttons appear based on status

### 6. Confirmation Dialog

A dialog will appear asking you to confirm sending the invitation.

### 7. Check Success

You should see a toast notification at the top:

```
✅ Invitation sent to Aarav Sharma
```

---

## What Happens Next

1. **Email Sent** → Email is sent via SMTP to Mailpit
2. **Check Mailpit** → Go to `http://localhost:8025`
3. **View Email** → Click the email to see the activation link
4. **Copy Link** → The link looks like: `http://localhost:3000/applicant/activate?token=...`
5. **Activate** → Applicant clicks the link and sets password
6. **Login** → Applicant can now login to portal

---

## Button Conditions

The "Send Invitation" button appears differently based on invitation status:

| Status       | Button Shown                                 |
| ------------ | -------------------------------------------- |
| **None**     | "Send Invitation"                            |
| **Pending**  | "Resend Invitation" + "Copy Link" + "Revoke" |
| **Accepted** | (No buttons, shows activated date)           |
| **Expired**  | "Send Invitation"                            |
| **Revoked**  | "Send Invitation"                            |

---

## Requirements

✅ Applicant must have an **email address**  
✅ Email is required to send invitation  
✅ If no email: "Add an email before sending an invitation"

---

## Complete Workflow Example

```
1. Go to Applicants
   └─ See list of applicants

2. Click "Aarav Sharma"
   └─ Opens applicant detail page
   └─ Shows: Info, Documents, Notes, Activity Log, Portal tabs

3. Click "Portal" Tab
   └─ Shows "Portal Account" card
   └─ Status: "None" (not invited yet)

4. Click "Send Invitation" Button
   └─ Dialog appears asking to confirm

5. Confirm
   └─ Toast shows: "Invitation sent to Aarav Sharma"
   └─ Email sent to: aarav.sharma@example.com
   └─ Via: SMTP localhost:1025 (Mailpit)

6. Check Email
   └─ Open: http://localhost:8025
   └─ See email from: noreply@system.local
   └─ Subject: Your Portal Account Invitation
   └─ Contains activation link with token

7. Copy Activation Link
   └─ From email, copy link
   └─ Format: http://localhost:3000/applicant/activate?token=<LONG_TOKEN>

8. Activate Account
   └─ Paste link in browser
   └─ Set password (must be complex)
   └─ Click "Activate Account"
   └─ See success message

9. Login to Portal
   └─ Go to: http://localhost:3000/applicant/login
   └─ Email: aarav.sharma@example.com
   └─ Password: (what they just set)
   └─ Access granted! ✅
```

---

## Screenshots (Text Description)

### Portal Tab - Before Invitation

```
┌─────────────────────────────────────────────┐
│ Portal Account                         None │
├─────────────────────────────────────────────┤
│ [Send Invitation]                           │
└─────────────────────────────────────────────┘
```

### Portal Tab - After Invitation (Pending)

```
┌─────────────────────────────────────────────┐
│ Portal Account                       Pending │
├─────────────────────────────────────────────┤
│ Invited By: System Admin                    │
│ Invitation Date: 6 Jul 2026                 │
│ Expiration: 13 Jul 2026                     │
│                                             │
│ [Resend] [Copy Link] [Revoke Invitation]   │
└─────────────────────────────────────────────┘
```

### Portal Tab - After Activation (Accepted)

```
┌─────────────────────────────────────────────┐
│ Portal Account                     Activated │
├─────────────────────────────────────────────┤
│ Invited By: System Admin                    │
│ Invitation Date: 6 Jul 2026                 │
│ Expiration: 13 Jul 2026                     │
│ Activated Date: 7 Jul 2026                  │
│                                             │
│ (No buttons - account is active)            │
└─────────────────────────────────────────────┘
```

---

## Troubleshooting

### "No email address" Error

- The applicant doesn't have an email
- Solution: Go to "Info" tab → Click "Edit" → Add email address → Save

### Email Not Appearing in Mailpit

- Check if Mailpit is running: `docker ps | grep mailpit`
- Check API logs for errors: `pnpm dev` output
- Mailpit should be at: `http://localhost:8025`

### Can't Find Portal Tab

- Make sure you're viewing an applicant detail page (not list)
- Tabs should be: Info | Documents | Notes | Activity Log | Portal
- If "Portal" tab not visible, try refreshing the page

### Invitation Already Sent

- If you see "Resend Invitation" instead of "Send Invitation", an invitation already exists
- Status is "Pending" → applicant hasn't activated yet
- You can "Resend Invitation" to send a new one

---

## Summary

**To send an invitation:**

1. Go to Applicants → Select applicant
2. Click **"Portal" tab**
3. Click **"Send Invitation"**
4. Check email at `http://localhost:8025`
5. Copy activation link and test!

**That's it!** 🎉
