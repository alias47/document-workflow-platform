# 17_LOGGING_MONITORING.md

# Logging & Monitoring

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the logging and monitoring standards for the Document Workflow Platform.

The objectives are to:

- Improve debugging
- Detect problems early
- Monitor application health
- Support incident investigation
- Improve performance
- Maintain security compliance
- Support future scalability

Logging should provide developers with enough information to diagnose problems while protecting sensitive user data.

---

# 2. Logging Principles

The platform follows these logging principles.

---

## Structured Logging

All logs should be machine-readable.

Preferred format:

```json
{
    "timestamp": "",
    "level": "",
    "requestId": "",
    "module": "",
    "message": ""
}
```

---

## Consistency

Every module should log using the same format.

---

## Traceability

Every request should be traceable from beginning to end.

---

## Security

Sensitive information must never be logged.

---

## Observability

Every important application event should be observable through logs or monitoring.

---

## Performance

Logging should have minimal impact on application performance.

Asynchronous logging should be preferred where possible.

---

# 3. Logging Levels

The application uses five standard logging levels.

| Level | Purpose |
|---------|----------|
| DEBUG | Development information |
| INFO | Normal application events |
| WARN | Recoverable problems |
| ERROR | Failed operations |
| FATAL | Critical application failures |

---

## DEBUG

Examples

- SQL execution time
- Function execution
- Cache hits
- Development diagnostics

Disabled in production.

---

## INFO

Examples

- User Login
- Applicant Created
- Workflow Completed
- Document Uploaded

---

## WARN

Examples

- Invalid Login Attempt
- Rate Limit Triggered
- Validation Failure
- Slow API Response

---

## ERROR

Examples

- Database Failure
- Upload Failure
- Email Sending Failure
- External API Failure

---

## FATAL

Examples

- Database Offline
- Storage Unavailable
- Application Crash
- Configuration Failure

Immediate operational attention is required.

---

# 4. Log Format

Every log entry should follow a consistent structure.

---

## Required Fields

| Field | Description |
|---------|-------------|
| Timestamp | UTC Timestamp |
| Level | Log Level |
| Request ID | Request Identifier |
| Module | Source Module |
| User ID | Authenticated User |
| Organization ID | Organization |
| Message | Description |
| Metadata | Additional Information |

---

## Example

```json
{
    "timestamp": "2026-07-01T09:30:15Z",
    "level": "INFO",
    "requestId": "req_234567",
    "module": "Applicants",
    "userId": "usr_123",
    "organizationId": "org_789",
    "message": "Applicant created successfully.",
    "metadata": {
        "applicantId": "app_456"
    }
}
```

---

# 5. Request Correlation IDs

Every incoming request must receive a unique Request ID.

The same Request ID should be included in every log generated while processing that request.

---

## Benefits

- Easier debugging
- Distributed tracing
- Faster incident investigation
- Better support

---

## Flow

```text
Client

↓

API Gateway

↓

NestJS

↓

Database

↓

Cloudflare R2

↓

Email Service

↓

Response
```

Every component should use the same Request ID.

---

# 6. Application Logs

Application logs record normal system behavior.

Examples

- User Login
- Logout
- Applicant Created
- Document Uploaded
- Workflow Approved
- Invitation Sent
- Search Executed
- Dashboard Viewed

Application logs help understand system usage and diagnose application issues.

---

# 7. API Request Logging

Every HTTP request should be logged.

---

## Log

- Method
- URL
- Status Code
- Response Time
- User ID
- Organization ID
- Request ID
- IP Address
- User Agent

---

## Example

```text
POST

/api/applicants

201

185ms
```

---

## Do Not Log

Never log:

- Passwords
- JWT Tokens
- Refresh Tokens
- Uploaded Files
- Request Bodies containing sensitive data

---

# 8. Database Logging

Database logging should focus on performance and failures.

---

## Log

- Query Duration
- Failed Queries
- Transaction Rollbacks
- Deadlocks
- Connection Failures
- Migration Execution

---

## Slow Queries

Queries exceeding

```
500 ms
```

should generate a warning log for investigation.

---

## Do Not Log

Avoid logging complete SQL queries containing sensitive values in production.

Parameterized queries should be preferred.

# 9. Authentication Logging

Authentication events are security-sensitive and should always be logged.

---

## Log Successful Events

- User Login
- User Logout
- Password Changed
- Password Reset Completed
- Refresh Token Issued
- Session Expired
- Multi-Factor Authentication Success (Future)

---

## Log Failed Events

- Invalid Login
- Expired Token
- Invalid Token
- Account Locked
- Too Many Login Attempts
- Invalid Password Reset Token
- Failed MFA Verification (Future)

---

## Log Information

Every authentication log should include:

- Timestamp
- Request ID
- User ID (if known)
- Email Address (masked when appropriate)
- IP Address
- User Agent
- Authentication Method
- Result (Success or Failure)

---

## Security Rules

Authentication logs should never include:

- Passwords
- JWT Tokens
- Refresh Tokens
- OTP Codes
- Secret Keys

---

# 10. Authorization Logging

Authorization logs record permission decisions.

---

## Log Events

- Permission Denied
- Unauthorized Resource Access
- Organization Boundary Violation
- Admin Access
- Role Changes
- Permission Updates

---

## Example

```text
User attempted to access another organization's applicant.
```

---

## Purpose

Authorization logs support:

- Security Investigations
- Compliance
- Abuse Detection
- Incident Response

---

# 11. File Upload Logging

Every upload operation should be logged.

---

## Log Events

- Upload Started
- Upload Completed
- Upload Failed
- File Deleted
- File Downloaded
- File Previewed

---

## Metadata

Record:

- File ID
- Original Filename
- Generated Filename
- File Size
- MIME Type
- User ID
- Organization ID
- Upload Duration

---

## Failed Uploads

Failed uploads should include:

- Failure Reason
- Storage Provider
- Request ID
- Retry Count (if applicable)

---

# 12. Audit Logs vs Application Logs

Application logs and audit logs serve different purposes.

---

## Application Logs

Purpose:

System operation and troubleshooting.

Examples:

- API requests
- Performance metrics
- Database queries
- Errors
- Upload failures

Application logs may be rotated and eventually deleted.

---

## Audit Logs

Purpose:

Record user actions affecting business data.

Examples:

- Applicant Created
- Applicant Updated
- Document Approved
- Workflow Stage Changed
- User Invited
- Permission Modified

Audit logs are business records and should be retained according to organizational or legal requirements.

---

## Key Differences

| Application Logs | Audit Logs |
|------------------|------------|
| Troubleshooting | Compliance |
| Operational | Business Activity |
| Short-Term Retention | Long-Term Retention |
| Developer Focus | Business & Security Focus |

---

# 13. Error Logging

Unexpected errors must always be logged.

---

## Include

- Request ID
- Error Code
- Stack Trace
- Module
- User ID
- Organization ID
- Timestamp

---

## Example

```json
{
    "level": "ERROR",
    "module": "Applicants",
    "errorCode": "DATABASE_ERROR",
    "requestId": "req_123456"
}
```

---

## Stack Traces

Stack traces should be stored only in server logs.

They must never be returned to the frontend.

---

# 14. Performance Logging

Performance logging identifies slow operations before users experience significant issues.

---

## Monitor

- API Response Time
- Database Query Duration
- File Upload Duration
- File Download Duration
- Search Duration
- Workflow Processing Time
- Background Job Duration (Future)

---

## Warning Thresholds

Recommended initial thresholds:

| Operation | Warning Threshold |
|-----------|------------------:|
| API Request | 500 ms |
| Database Query | 500 ms |
| File Upload | 5 seconds |
| File Download | 3 seconds |
| Search | 1 second |

Thresholds should be reviewed and adjusted as the application grows.

---

# 15. Monitoring Metrics

The platform should continuously collect operational metrics.

---

## API Metrics

Track:

- Requests per Minute
- Success Rate
- Error Rate
- Average Response Time
- Slowest Endpoints

---

## Database Metrics

Track:

- Active Connections
- Query Duration
- Slow Queries
- Failed Transactions
- Connection Pool Usage

---

## Storage Metrics

Track:

- Upload Success Rate
- Upload Failures
- Storage Usage
- Average Upload Size
- Average Download Time

---

## Authentication Metrics

Track:

- Successful Logins
- Failed Logins
- Locked Accounts
- Password Reset Requests
- Active Sessions

These metrics help identify security threats and user behavior patterns.

---

# 16. Health Checks

Health check endpoints allow infrastructure and monitoring tools to verify system availability.

---

## Health Endpoints

Examples:

```text
GET /health

GET /health/ready

GET /health/live
```

---

## Verify

Health checks should confirm the availability of:

- Backend API
- PostgreSQL Database
- Cloudflare R2 Storage
- Email Service
- Background Job Queue (when implemented)

---

## Response Example

```json
{
    "status": "healthy",
    "services": {
        "database": "up",
        "storage": "up",
        "email": "up"
    }
}
```

Health endpoints should be lightweight and not perform expensive operations.

# 17. Alerts & Notifications

Monitoring systems should automatically notify the development team when critical events occur.

Alerts should be actionable and minimize unnecessary noise.

---

## Alert Severity

| Severity | Description | Action |
|----------|-------------|--------|
| Low | Informational | Log Only |
| Medium | Requires Investigation | Dashboard Notification |
| High | Service Impact | Notify Development Team |
| Critical | Major Outage | Immediate Incident Response |

---

## Critical Alerts

Immediate alerts should be generated for:

- Database Unavailable
- Storage Service Failure
- API Unavailable
- Application Crash
- Repeated Authentication Failures
- High Error Rate
- Failed Database Migrations
- Disk Space Critically Low
- Memory Exhaustion

---

## High Priority Alerts

Examples:

- Slow Database
- High API Response Time
- Upload Failure Rate Above Threshold
- Email Delivery Failure
- Search Service Degradation

---

## Alert Rules

Alerts should:

- Include Request IDs when available
- Include affected module
- Include timestamp
- Avoid duplicate notifications
- Support escalation if unresolved

---

# 18. Monitoring Dashboard

A centralized dashboard should provide real-time visibility into the system.

---

## Dashboard Sections

### System Health

Display:

- API Status
- Database Status
- Storage Status
- Email Service Status

---

### Traffic

Display:

- Requests per Minute
- Active Users
- Concurrent Sessions
- Peak Usage Times

---

### Errors

Display:

- Error Rate
- Top Error Codes
- Failed Requests
- Recent Exceptions

---

### Performance

Display:

- Average Response Time
- Slow Endpoints
- Slow Database Queries
- Upload Performance
- Search Performance

---

### Business Metrics

Display:

- Applicants Created
- Documents Uploaded
- Workflows Completed
- Invitations Sent
- Active Organizations

These metrics help correlate system performance with business activity.

---

# 19. Log Retention Policy

Different log types have different retention requirements.

---

## Recommended Retention

| Log Type | Retention |
|----------|-----------|
| Debug Logs | 7 Days |
| Info Logs | 30 Days |
| Warning Logs | 90 Days |
| Error Logs | 180 Days |
| Audit Logs | 2–7 Years (Based on business/legal requirements) |

Retention periods should be configurable.

---

## Log Rotation

Implement automatic log rotation to:

- Prevent excessive disk usage
- Improve search performance
- Simplify backups

Old logs should be archived or deleted according to the retention policy.

---

# 20. Sensitive Data Handling

Logs must never expose confidential information.

---

## Never Log

- Passwords
- JWT Tokens
- Refresh Tokens
- API Keys
- Secret Keys
- OTP Codes
- Session Cookies
- Credit Card Data
- Full Personal Identification Numbers

---

## Mask Sensitive Values

Example:

Instead of:

```text
john.doe@example.com
```

Log:

```text
jo****@example.com
```

Similarly, mask phone numbers and other personally identifiable information when full values are unnecessary.

---

## Access Control

Production logs should only be accessible to authorized personnel.

Access to logs should itself be auditable.

---

# 21. Recommended Monitoring Stack

The monitoring stack may evolve, but the following technologies are recommended.

---

## Logging

- NestJS Logger (Initial)
- Pino (Structured Logging)
- Winston (Alternative)

---

## Monitoring

- Prometheus
- Grafana

---

## Error Tracking

- Sentry

---

## Uptime Monitoring

- UptimeRobot
- Better Stack
- Pingdom

---

## Cloud Infrastructure

Future integrations may include monitoring provided by:

- Cloudflare
- Docker
- Kubernetes
- Hosting Provider

Technology choices can change over time without affecting the monitoring principles defined in this document.

---

# 22. Incident Response Workflow

When a critical incident occurs, the following workflow should be followed.

---

## Step 1

Detect the issue through monitoring or alerts.

---

## Step 2

Assess severity.

Classify as:

- Low
- Medium
- High
- Critical

---

## Step 3

Identify:

- Affected services
- Root cause
- Number of impacted users

---

## Step 4

Mitigate the issue.

Examples:

- Restart service
- Roll back deployment
- Restore database
- Switch to backup service

---

## Step 5

Verify recovery.

Confirm:

- Health checks pass
- Error rate returns to normal
- Users can access the system

---

## Step 6

Conduct a post-incident review.

Document:

- Timeline
- Root cause
- Resolution
- Preventive actions

---

# 23. Monitoring Checklist

Before each production release, verify:

- Logging enabled
- Structured log format
- Health endpoints operational
- Alerts configured
- Monitoring dashboard updated
- Error tracking active
- Log retention configured
- Sensitive data masked
- Request IDs generated
- Critical services monitored

---

# 24. Summary

The Document Workflow Platform adopts a structured logging and monitoring strategy that supports reliable operations, rapid troubleshooting, and long-term scalability.

Key principles include:

- Structured JSON logging
- Standard logging levels
- Request correlation IDs
- Secure handling of sensitive data
- Comprehensive API, database, authentication, and file operation logging
- Separation of application logs and audit logs
- Performance monitoring
- Automated health checks
- Real-time dashboards
- Configurable alerting
- Log retention and rotation
- Incident response procedures

Following these standards ensures the platform remains observable, maintainable, and resilient as it grows from an MVP into a production-grade SaaS application.

---

# End of Document