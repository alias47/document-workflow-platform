# TASK.md

# Sprint 4 – UX Completion Layer

## Objective

Improve interaction quality, usability consistency, and feedback states across the existing application.

No new features or pages should be introduced.

Focus only on UX polish of existing UI built in Sprint 1–3.5.

---

## Scope

### 1. Form UX Improvements

Apply across:

- Login
- Forgot Password
- Reset Password
- Applicant Filters/Search

Enhancements:

- Loading state on submit buttons
- Disabled state when submitting
- Disabled state when form is invalid
- Consistent error message styling
- Success feedback states where missing

---

### 2. Password UX (Reset Password Page)

Enhancements:

- Password strength meter (visual only)
- Password requirements checklist:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character
- Real-time password match indicator

---

### 3. Applicants Table UX

Enhancements:

- Row hover highlighting
- Checkbox selection (single + multi-select)
- Bulk action bar (UI only):
  - Archive Selected
  - Export Selected
- Improved empty state design

---

### 4. Feedback System Standardization

Ensure consistent UX for:

- Success toast
- Error toast
- Info toast
- Loading indicators

All actions must provide user feedback (even in mock mode).

---

### 5. Dashboard Micro UX Improvements

Enhancements:

- Improve visibility of trend indicators
- Add hover feedback on stat cards
- Optional subtle animation for activity feed items

---

## Rules

- Do NOT create new pages
- Do NOT add backend logic
- Do NOT add API integration
- Do NOT change architecture or folder structure
- Do NOT introduce new libraries
- Use existing components only
- Keep changes inside existing feature modules

---

## Out of Scope

- Backend development
- Authentication logic
- File uploads
- Workflow engine
- Notifications system
- New UI modules

---

## Definition of Done

- All forms have loading + disabled states
- Password UX is fully enhanced
- Applicants table supports selection + bulk UI
- Toast system is consistent
- Dashboard interactions improved
- No missing UX feedback states
- No architecture changes introduced

---

## Validation

Run before completion:

pnpm lint
pnpm type-check
pnpm build

---

## Output Required

- List of UX improvements implemented
- Files modified
- Any inconsistencies found
