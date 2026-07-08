# Sprint 12.5 — Integration & End-to-End Testing

**Project:** Document Workflow Platform

**Sprint:** 12.5

**Status:** Ready for Implementation

---

# 1. Sprint Goal

Introduce production-grade integration and end-to-end testing for the application's most critical workflows.

The objective is to validate that modules work together correctly against a real database and that complete user journeys succeed from start to finish.

No business functionality should be changed except where necessary to improve testability or fix defects discovered during testing.

---

# 2. Objectives

Implement:

- Integration test infrastructure
- End-to-end (E2E) test infrastructure
- Test database configuration
- Seed data for tests
- Critical workflow integration tests
- Smoke E2E tests
- CI-compatible test commands

---

# 3. Scope

Include:

- API integration tests
- Real PostgreSQL test database
- Full Nest application bootstrap
- Authentication flows
- Applicant lifecycle
- Document upload/review
- Reports
- Dashboard

Out of Scope:

- Frontend UI automation (Playwright/Cypress)
- Performance testing
- Load testing

---

# 4. Test Infrastructure

Create dedicated integration and E2E test setup.

Requirements:

- Separate test database
- Automatic cleanup
- Independent migrations
- Independent seed
- Parallel-safe execution where practical

---

# 5. Authentication Integration Tests

Verify:

- Staff login
- Applicant login
- Refresh token rotation
- Refresh replay detection
- Logout
- Logout all sessions
- Password reset
- Invitation activation

---

# 6. Applicant Lifecycle Tests

Verify complete flow:

Admin Login

↓

Create Applicant

↓

Assign Staff

↓

Workflow Created

↓

Requirements Generated

↓

Invitation Sent

↓

Applicant Activated

↓

Applicant Login

↓

Upload Document

↓

Staff Review

↓

Requirement Updated

↓

Applicant Downloads Document

---

# 7. Organization Isolation Tests

Verify:

- Cross-org applicant access denied
- Cross-org document access denied
- Cross-org search denied
- Cross-org reports denied
- Cross-org dashboard denied

---

# 8. Reports Integration

Verify:

- Applicant report
- Document report
- Workflow report
- Staff workload

Export:

- CSV
- Excel
- PDF

---

# 9. Dashboard Integration

Verify:

- Summary
- Activity
- Workload
- Permission enforcement

---

# 10. Storage Integration

Verify:

- File upload
- Download
- Checksum
- Soft delete behavior

---

# 11. Regression Suite

Every future PR should execute:

- Unit tests
- Integration tests
- E2E smoke tests

---

# 12. Acceptance Criteria

Complete when:

- Integration infrastructure exists.
- E2E infrastructure exists.
- Test DB is isolated.
- Critical workflows are fully covered.
- Organization isolation is verified.
- Authentication flows are verified.
- Dashboard and reports are verified.
- Storage integration is verified.
- All tests pass.

---

# 13. Deliverables

Claude must provide:

1. Integration test infrastructure
2. E2E test infrastructure
3. New test suites
4. Updated scripts/documentation
5. Sprint Completion Report including:
   - Files Created
   - Files Modified
   - Test Coverage Added
   - Infrastructure Changes
   - Validation Results
