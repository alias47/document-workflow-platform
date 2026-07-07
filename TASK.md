# Sprint 12.3 — Pilot Readiness & Applicant Portal Completion

**Project:** Document Workflow Platform

**Sprint:** 12.3

**Status:** Ready for Implementation

---

# 1. Sprint Goal

Complete the remaining critical applicant portal functionality identified in the MVP Readiness Audit.

This sprint focuses on ensuring that an applicant can independently complete the entire document submission workflow without staff intervention.

No new business modules or major UI redesigns will be introduced.

---

# 2. Objectives

Implement:

- Fix applicant document upload data integrity
- Correct applicant upload audit logging
- Applicant document listing
- Applicant document download
- Applicant document preview support (when applicable)
- Display document verification feedback
- Enforce portal profile editing settings
- Automatically synchronize requirement status after document verification
- Add integration testing for the applicant upload workflow

---

# 3. Scope

This sprint applies only to:

- Applicant Portal
- Document Module
- Document Review
- Requirement Tracking
- Audit Logging
- Integration Testing

Out of Scope:

- Calendar
- Tasks
- Notification redesign
- New workflow stages
- New RBAC features
- Sidebar redesign
- Dashboard redesign
- Mobile optimization
- AI/OCR

---

# 4. Applicant Upload Data Integrity

Review the complete applicant upload flow.

The current implementation incorrectly associates applicant uploads with a Staff foreign key.

Correct the data model and upload logic so applicant uploads are stored without violating referential integrity.

Requirements:

- Preserve existing staff upload behavior.
- Maintain backward compatibility where possible.
- Avoid breaking existing document queries.
- Do not introduce duplicate document records.
- Existing staff upload functionality must remain unchanged.

---

# 5. Applicant Upload Audit

Review audit logging for applicant uploads.

Requirements:

- Record the correct actor type.
- Record the correct actor identifier.
- Preserve existing audit schema where possible.
- Activity logs must also correctly identify applicant actors.

---

# 6. Applicant Document Center

Applicants must be able to view every document they have uploaded.

Implement:

- Document list
- Upload date
- Requirement name
- Current verification status
- Current workflow status (if applicable)
- Latest version indicator

Ordering:

- Most recent first

Support pagination if required.

---

# 7. Applicant Document Download

Applicants must be able to download their own uploaded files.

Requirements:

- Organization isolation
- Applicant ownership validation
- Soft-delete checks
- Secure download endpoint
- Existing storage abstraction must be reused
- No direct storage exposure

Applicants must never access documents belonging to another applicant.

---

# 8. Document Preview

Where supported by the storage provider and file type:

Provide secure preview support for common document formats.

Examples:

- PDF
- JPEG
- PNG

If preview is unavailable, download remains available.

Do not duplicate storage logic.

---

# 9. Verification Feedback

Applicants must clearly understand why a document requires correction.

Expose:

- Verification status
- Review date
- Reviewer (optional)
- Rejection reason
- Verification notes

Do not expose internal staff-only comments.

---

# 10. Portal Profile Settings Enforcement

Review Applicant Profile editing.

Enforce:

portalAllowProfileEdit

If disabled:

- Editing endpoints reject updates.
- UI disables editing controls.
- Existing profile viewing remains available.

Organization settings remain the source of truth.

---

# 11. Requirement Synchronization

Review document verification.

When staff:

- approve document
- reject document

Automatically synchronize the corresponding Applicant Document Requirement status.

Business Rules:

Approved Document

↓

Requirement Approved

Rejected Document

↓

Requirement Rejected

Maintain transactional consistency.

Prevent conflicting states.

---

# 12. Integration Testing

Introduce real integration tests for the applicant upload workflow.

At minimum verify:

Applicant Activation

↓

Login

↓

Upload Document

↓

Database Persistence

↓

Audit Log

↓

Activity Log

↓

Document Listing

↓

Download

↓

Verification

↓

Requirement Synchronization

↓

Portal Display

Tests must execute against a real database.

Mock-only testing is insufficient.

---

# 13. Regression Review

Ensure the following continue working:

- Staff uploads
- Staff document review
- Reports
- Dashboard
- Search
- Activity Log
- Audit Log
- Notifications

No existing functionality may regress.

---

# 14. Acceptance Criteria

The sprint is complete when:

- Applicant uploads succeed without FK violations.
- Applicant uploads are correctly attributed.
- Applicants can view uploaded documents.
- Applicants can securely download their own documents.
- Preview works where supported.
- Rejection reasons are visible.
- Portal profile editing obeys organization settings.
- Requirement status automatically synchronizes.
- Integration tests cover the upload workflow.
- All existing tests continue passing.
- No regressions are introduced.

---

# 15. Deliverables

Claude must provide:

1. Updated backend implementation
2. Updated frontend implementation
3. Integration tests
4. Updated unit tests (if required)
5. Completion Report including:

- Files Created
- Files Modified
- Database Changes
- API Changes
- Frontend Changes
- Business Rules
- Security Review
- Test Results
- Documentation Notes
- Acceptance Criteria Confirmation
