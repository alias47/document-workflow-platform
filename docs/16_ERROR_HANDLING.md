# 16_ERROR_HANDLING.md

# Error Handling

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the standard error handling strategy for the Document Workflow Platform.

A consistent error handling strategy improves:

- User Experience
- Debugging
- Monitoring
- Security
- API Consistency
- Maintainability

Every application layer must follow these standards.

---

# 2. Error Handling Principles

The platform follows these principles:

- Fail Fast
- Fail Safely
- Never Hide Errors
- Log Every Unexpected Error
- Return User-Friendly Messages
- Never Leak Sensitive Information

---

## Core Principles

### Predictable

Every API returns errors in the same format.

---

### Secure

Internal implementation details must never be exposed.

---

### Traceable

Every unexpected error must be logged.

---

### Recoverable

Whenever possible, users should be able to continue using the application.

---

### Actionable

Every error should tell the user what they can do next.

---

# 3. Error Categories

Errors are divided into several categories.

| Category | Example |
|-----------|----------|
| Validation Errors | Missing Email |
| Authentication Errors | Invalid Password |
| Authorization Errors | No Permission |
| Business Rule Errors | Duplicate Applicant |
| Resource Errors | Applicant Not Found |
| File Errors | Invalid Upload |
| Database Errors | Transaction Failed |
| Network Errors | API Timeout |
| External Service Errors | Email Provider Failed |
| Internal Server Errors | Unexpected Exception |

Each category should have a consistent response strategy.

---

# 4. Error Flow

The platform follows this error flow.

```text
Client

↓

Request

↓

Validation

↓

Authentication

↓

Authorization

↓

Business Logic

↓

Database

↓

Response
```

If an error occurs at any step:

- Stop execution immediately.
- Log the error if appropriate.
- Return the correct HTTP response.
- Never continue processing invalid requests.

---

# 5. Error Response Format

Every API must return the same response structure.

Success responses are defined in the API specification.

Error responses follow the format below.

```json
{
    "success": false,
    "message": "Validation failed.",
    "errorCode": "VALIDATION_ERROR",
    "errors": [],
    "requestId": "req_123456789"
}
```

---

## Fields

### success

Always

```json
false
```

---

### message

Human-readable message.

---

### errorCode

Machine-readable identifier.

---

### errors

Detailed validation errors when applicable.

---

### requestId

Used for debugging and support.

Every request should generate a unique request identifier.

# 6. Standard Error Codes

Every error returned by the API must include a standardized error code.

Error codes should remain stable over time to allow frontend applications to handle them programmatically.

---

## Validation Errors

| Error Code | Description |
|------------|-------------|
| VALIDATION_ERROR | General validation failure |
| REQUIRED_FIELD | Required field missing |
| INVALID_EMAIL | Invalid email address |
| INVALID_PHONE | Invalid phone number |
| INVALID_DATE | Invalid date |
| INVALID_FILE_TYPE | Unsupported file type |
| FILE_TOO_LARGE | File exceeds size limit |
| INVALID_ENUM_VALUE | Invalid enum value |

---

## Authentication Errors

| Error Code | Description |
|------------|-------------|
| INVALID_CREDENTIALS | Email or password incorrect |
| ACCOUNT_DISABLED | User account disabled |
| ACCOUNT_LOCKED | Too many failed attempts |
| INVALID_TOKEN | Invalid access token |
| TOKEN_EXPIRED | Access token expired |
| REFRESH_TOKEN_EXPIRED | Refresh token expired |
| MFA_REQUIRED | Multi-factor authentication required |

---

## Authorization Errors

| Error Code | Description |
|------------|-------------|
| ACCESS_DENIED | User lacks permission |
| ROLE_REQUIRED | Required role missing |
| ORGANIZATION_ACCESS_DENIED | Different organization |
| RESOURCE_FORBIDDEN | Resource access forbidden |

---

## Resource Errors

| Error Code | Description |
|------------|-------------|
| NOT_FOUND | Resource not found |
| APPLICANT_NOT_FOUND | Applicant does not exist |
| DOCUMENT_NOT_FOUND | Document does not exist |
| USER_NOT_FOUND | User does not exist |
| ORGANIZATION_NOT_FOUND | Organization not found |

---

## Business Errors

| Error Code | Description |
|------------|-------------|
| DUPLICATE_APPLICANT | Applicant already exists |
| DUPLICATE_EMAIL | Email already registered |
| WORKFLOW_ALREADY_COMPLETED | Workflow finished |
| INVALID_WORKFLOW_STAGE | Invalid stage transition |
| DOCUMENT_ALREADY_APPROVED | Document already approved |

---

## File Errors

| Error Code | Description |
|------------|-------------|
| FILE_UPLOAD_FAILED | Upload failed |
| FILE_NOT_FOUND | File missing |
| STORAGE_UNAVAILABLE | Storage unavailable |
| FILE_CORRUPTED | Corrupted file |
| FILE_SCAN_FAILED | Virus scan failed (Future) |

---

## Server Errors

| Error Code | Description |
|------------|-------------|
| INTERNAL_SERVER_ERROR | Unexpected server error |
| DATABASE_ERROR | Database operation failed |
| NETWORK_ERROR | Network issue |
| EXTERNAL_SERVICE_ERROR | Third-party service failure |
| UNKNOWN_ERROR | Unknown error |

---

# 7. HTTP Status Code Mapping

The platform should consistently use HTTP status codes.

| Status Code | Meaning | Example |
|-------------|---------|----------|
| 200 | Success | Fetch Applicant |
| 201 | Created | Applicant Created |
| 204 | No Content | Successful Delete |
| 400 | Bad Request | Invalid Request |
| 401 | Unauthorized | Login Required |
| 403 | Forbidden | Permission Denied |
| 404 | Not Found | Applicant Missing |
| 409 | Conflict | Duplicate Email |
| 413 | Payload Too Large | File Too Large |
| 415 | Unsupported Media Type | Invalid File Type |
| 422 | Validation Failed | Invalid Form |
| 429 | Too Many Requests | Rate Limited |
| 500 | Internal Error | Unexpected Failure |
| 502 | Bad Gateway | External API Failure |
| 503 | Service Unavailable | Maintenance |

---

# 8. Validation Errors

Validation errors occur before business logic executes.

Examples include:

- Missing fields
- Invalid email
- Invalid dates
- Invalid IDs
- Incorrect file types
- Invalid query parameters

---

## Validation Response

```json
{
    "success": false,
    "message": "Validation failed.",
    "errorCode": "VALIDATION_ERROR",
    "errors": [
        {
            "field": "email",
            "message": "Email address is required."
        },
        {
            "field": "phone",
            "message": "Invalid phone number."
        }
    ]
}
```

---

## Rules

Validation should stop invalid requests before:

- Database queries
- Business logic
- File uploads
- External API calls

---

# 9. Authentication Errors

Authentication errors occur when user identity cannot be verified.

Examples

- Invalid password
- Expired token
- Invalid JWT
- Missing access token

---

## Response

```json
{
    "success": false,
    "message": "Authentication required.",
    "errorCode": "INVALID_TOKEN"
}
```

---

## Security Rules

Authentication responses should never reveal:

- Whether an email exists
- Which credential failed
- Internal authentication logic

Avoid:

```text
Email exists but password is incorrect.
```

Prefer:

```text
Invalid email or password.
```

---

# 10. Authorization Errors

Authorization errors occur after authentication succeeds.

Examples

- User lacks required role
- User belongs to another organization
- Permission denied
- Attempt to access restricted resources

---

## Response

```json
{
    "success": false,
    "message": "You do not have permission to perform this action.",
    "errorCode": "ACCESS_DENIED"
}
```

---

## Rules

Authorization should be verified:

- Before business logic
- Before database modifications
- Before file access
- Before workflow actions

Permission checks should fail immediately without exposing resource details.

# 11. Business Rule Errors

Business rule errors occur when a request is valid but violates application rules.

These errors are generated by the service layer after validation and authorization have succeeded.

---

## Examples

- Applicant already exists
- Workflow already completed
- Document already approved
- Consultant already assigned
- Maximum number of documents reached
- Duplicate organization name
- Invitation already accepted
- User already belongs to another organization

---

## Response

```json
{
    "success": false,
    "message": "Applicant already exists.",
    "errorCode": "DUPLICATE_APPLICANT"
}
```

---

## Rules

Business rule errors should:

- Be predictable
- Return meaningful messages
- Never expose internal implementation
- Never be treated as server errors

---

# 12. Resource Errors

Resource errors occur when the requested resource cannot be found.

Examples

- Applicant not found
- Document not found
- User not found
- Organization not found
- Workflow not found

---

## Response

```json
{
    "success": false,
    "message": "Applicant not found.",
    "errorCode": "APPLICANT_NOT_FOUND"
}
```

---

## Rules

Return

```
404 Not Found
```

Avoid exposing whether restricted resources exist.

For unauthorized users, prefer returning:

```
403 Forbidden
```

instead of confirming resource existence.

---

# 13. File Upload Errors

File uploads require additional validation before storage.

---

## Validation Order

```text
Request

↓

Authentication

↓

Authorization

↓

File Exists

↓

File Size

↓

File Type

↓

Virus Scan (Future)

↓

Storage Upload

↓

Database Record
```

---

## Common Errors

- File Too Large
- Unsupported File Type
- Empty File
- Corrupted File
- Upload Failed
- Storage Service Unavailable

---

## Example Response

```json
{
    "success": false,
    "message": "Only PDF documents are allowed.",
    "errorCode": "INVALID_FILE_TYPE"
}
```

---

## Upload Rules

Maximum upload size should be configurable.

Supported MIME types should be validated.

Uploaded filenames should never be trusted.

Always generate unique server-side filenames.

---

# 14. Database Errors

Database errors should never be exposed directly to users.

---

## Examples

- Connection Failure
- Transaction Failure
- Constraint Violation
- Deadlock
- Timeout

---

## User Response

```json
{
    "success": false,
    "message": "An unexpected error occurred.",
    "errorCode": "DATABASE_ERROR"
}
```

---

## Internal Logging

Log:

- SQL Error
- Stack Trace
- Request ID
- User ID
- Module
- Timestamp

Do not return raw database errors to clients.

---

# 15. External Service Errors

The application communicates with external services such as:

- Email Provider
- Cloudflare R2 Storage
- Future SMS Provider
- Future Payment Provider

---

## Failure Strategy

If an external service fails:

- Retry when appropriate
- Log the failure
- Notify administrators if required
- Return a user-friendly message

---

## Response

```json
{
    "success": false,
    "message": "The requested service is temporarily unavailable.",
    "errorCode": "EXTERNAL_SERVICE_ERROR"
}
```

---

## Retry Policy

Recommended retry strategy:

| Attempt | Delay |
|----------|-------|
| 1 | Immediate |
| 2 | 2 seconds |
| 3 | 5 seconds |
| 4 | 10 seconds |

After the final retry, the operation should fail gracefully.

---

# 16. Global Exception Handling

All unexpected exceptions should be handled by a global exception filter.

The application should never expose stack traces to end users.

---

## Responsibilities

The global exception handler should:

- Catch unhandled exceptions
- Log errors
- Generate request IDs
- Return standardized responses
- Hide implementation details

---

## Response Example

```json
{
    "success": false,
    "message": "An unexpected error occurred.",
    "errorCode": "INTERNAL_SERVER_ERROR",
    "requestId": "req_123456789"
}
```

---

## Never Return

Never expose:

- Stack traces
- SQL queries
- File paths
- Internal server names
- Framework exceptions
- Environment variables
- Secret values

These details belong only in server logs.

---

# 17. Frontend Error Handling

The frontend should display clear, actionable error messages.

Users should understand:

- What happened
- Why it happened (when appropriate)
- What they can do next

---

## Error Types

Frontend should handle:

- Validation Errors
- Authentication Errors
- Authorization Errors
- Network Errors
- Server Errors
- Unexpected Errors

---

## Display Strategy

Validation Errors

- Display inline beside the affected field.

Authentication Errors

- Display a banner or toast.

Authorization Errors

- Show an access denied page or message.

Network Errors

- Allow users to retry the request.

Server Errors

- Show a generic error message and encourage retrying later.

Unexpected Errors

- Display a friendly fallback page with a request ID if available.

---

# 18. React Error Boundaries

React Error Boundaries should prevent application crashes caused by rendering errors.

Error Boundaries should wrap:

- Dashboard
- Applicant Module
- Document Module
- Workflow Module
- Settings Module

A failure in one section should not break the entire application.

---

## Fallback UI

Error pages should include:

- Friendly message
- Retry button
- Return to Dashboard
- Request ID (if available)

Developers should never expose technical details to users.

# 19. Logging Strategy

Every unexpected error should be logged.

Expected validation errors do not require error-level logging.

---

## Log Validation Errors

Level

```
Warning
```

Examples

- Invalid Email
- Missing Required Field
- Invalid File Type

---

## Log Business Errors

Level

```
Info
```

Examples

- Duplicate Applicant
- Invalid Workflow Transition
- Already Approved Document

These are expected business scenarios.

---

## Log System Errors

Level

```
Error
```

Examples

- Database Failure
- Storage Failure
- Unexpected Exception
- External API Failure

---

## Log Contents

Every error log should include:

- Timestamp
- Request ID
- User ID
- Organization ID
- Module
- Endpoint
- HTTP Method
- Error Code
- Stack Trace (Internal Only)

---

## Example

```json
{
    "requestId": "req_12345",
    "userId": "usr_123",
    "organizationId": "org_456",
    "module": "Applicants",
    "endpoint": "/api/applicants",
    "method": "POST",
    "errorCode": "DATABASE_ERROR",
    "timestamp": "2026-07-01T09:25:00Z"
}
```

---

# 20. Retry Strategy

Not every error should be retried.

---

## Retry Automatically

Examples

- Temporary Network Failure
- External Email Provider Timeout
- Cloud Storage Timeout
- Temporary Database Connection Issue

---

## Never Retry

Examples

- Validation Errors
- Authentication Errors
- Authorization Errors
- Duplicate Records
- Invalid Workflow Actions
- File Type Errors

Retrying these requests will always produce the same result.

---

## Exponential Backoff

Recommended delays

```text
Attempt 1

↓

1 second

↓

Attempt 2

↓

2 seconds

↓

Attempt 3

↓

5 seconds

↓

Attempt 4

↓

10 seconds

↓

Fail
```

This reduces load on dependent services.

---

# 21. User-Friendly Error Messages

Users should receive clear, actionable messages.

Avoid technical language.

---

## Good Examples

Instead of

```text
Prisma P2002 Error
```

Display

```text
An account with this email already exists.
```

---

Instead of

```text
JWT verification failed
```

Display

```text
Your session has expired. Please sign in again.
```

---

Instead of

```text
Database connection timeout
```

Display

```text
We're experiencing a temporary issue. Please try again in a few moments.
```

---

## Message Guidelines

Messages should:

- Be polite
- Explain the problem
- Suggest a next step when appropriate
- Avoid blaming the user
- Avoid exposing internal system details

---

# 22. Offline & Network Handling

The frontend should gracefully handle network interruptions.

---

## Detect Network Issues

Examples

- Internet disconnected
- Server unavailable
- Request timeout
- DNS resolution failure

---

## User Experience

When a network issue occurs:

- Display a clear message.
- Offer a Retry action.
- Preserve unsaved form data whenever possible.
- Avoid losing user progress.

---

## Example

```text
Unable to connect to the server.

Please check your internet connection and try again.
```

---

# 23. Monitoring & Alerting

Critical errors should trigger operational monitoring.

Examples include:

- Repeated login failures
- Database outages
- Storage failures
- Unexpected application crashes
- High error rates

---

## Alert Severity

| Severity | Action |
|----------|--------|
| Low | Log Only |
| Medium | Dashboard Alert |
| High | Notify Development Team |
| Critical | Immediate Incident Response |

---

## Monitoring Metrics

Track:

- Error Rate
- API Failure Rate
- Upload Failure Rate
- Authentication Failure Rate
- Average Response Time
- Database Errors
- External Service Failures

These metrics help identify recurring issues before they affect users.

---

# 24. Testing Error Scenarios

Error handling should be tested as thoroughly as successful workflows.

---

## Unit Tests

Verify:

- Validation failures
- Business rule violations
- Service exceptions
- Utility error handling

---

## Integration Tests

Verify:

- Invalid API requests
- Permission failures
- Transaction rollbacks
- External service failures

---

## End-to-End Tests

Verify:

- Login failures
- Upload failures
- Unauthorized access
- Expired sessions
- Lost network connections

---

## Regression Tests

Whenever an error-related bug is fixed, add a regression test to prevent the issue from reappearing.

---

# 25. Summary

The Document Workflow Platform follows a consistent, secure, and user-focused error handling strategy across both the frontend and backend.

Key principles include:

- Standardized API error responses
- Consistent HTTP status codes
- Clear error categories
- Global exception handling
- User-friendly messages
- Secure handling of sensitive information
- Structured logging
- Appropriate retry strategies
- Frontend error boundaries
- Network resilience
- Operational monitoring
- Comprehensive testing of failure scenarios

By following these standards, the platform will provide predictable behavior for developers, meaningful feedback for users, and reliable diagnostics for support and operations teams.

---

# End of Document