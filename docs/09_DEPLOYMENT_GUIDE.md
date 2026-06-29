# 09_DEPLOYMENT_GUIDE.md

# Deployment Guide

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines how the Document Workflow Platform is deployed across all environments.

It provides standards for:

- Local Development
- Testing
- Pilot Deployment
- Production Deployment
- Infrastructure
- Security
- Monitoring
- Maintenance

The objective is to ensure deployments remain repeatable, secure, scalable, and easy to maintain.

---

# 2. Deployment Goals

The deployment architecture should achieve the following objectives.

## Simplicity

Developers should be able to run the project locally using a single command.

---

## Reliability

Deployments should minimize downtime.

The platform should recover quickly from failures.

---

## Security

Production deployments must protect:

- Applicant Documents
- User Accounts
- API Endpoints
- Database
- Secrets

---

## Scalability

The deployment should support:

- Single Consultancy (Pilot)
- Multiple Organizations
- Future SaaS Platform

without major infrastructure changes.

---

## Maintainability

Infrastructure should be reproducible.

Configuration should be automated wherever possible.

---

# 3. Environment Strategy

The platform uses three deployment environments.

---

## Development

Purpose

Local software development.

Characteristics

- Docker Compose
- Local PostgreSQL
- Local File Storage
- Mailpit
- Hot Reload
- Debug Logging

---

## Staging

Purpose

Internal testing before production.

Characteristics

- Cloud Deployment
- Production Configuration
- Test Data
- HTTPS Enabled
- Production Database Schema

---

## Production

Purpose

Serve real organizations.

Characteristics

- HTTPS
- Daily Backups
- Monitoring
- Cloud Storage
- Managed PostgreSQL
- Secure Logging
- Automatic Restarts

---

# Environment Flow

```text
Development

↓

Staging

↓

Production
```

Every deployment should progress through these environments.

---

# 4. Infrastructure Overview

```text
                    Internet
                        │
                        ▼
                  Cloudflare DNS
                        │
                        ▼
                    Nginx Proxy
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
    Next.js Frontend             NestJS Backend
                                        │
                     ┌──────────────────┼──────────────────┐
                     ▼                  ▼                  ▼
               PostgreSQL         Cloudflare R2       Email Provider
```

Each service has a clearly defined responsibility.

---

# 5. Technology Stack

| Component | Technology |
|-----------|------------|
| Operating System | Ubuntu Server LTS |
| Containerization | Docker |
| Orchestration | Docker Compose |
| Reverse Proxy | Nginx |
| Frontend | Next.js |
| Backend | NestJS |
| Database | PostgreSQL |
| Storage | Cloudflare R2 |
| Email | Resend / Amazon SES |
| SSL | Let's Encrypt |
| CI/CD | GitHub Actions |
| Monitoring | Uptime Kuma (Recommended) |
| Logging | Docker Logs + Winston/Pino |

---

# 6. Local Development

Developers should require minimal setup.

---

## Requirements

Install:

- Git
- Docker Desktop
- Node.js LTS
- pnpm

---

## Clone Repository

```bash
git clone https://github.com/company/document-workflow-platform.git

cd document-workflow-platform
```

---

## Install Dependencies

```bash
pnpm install
```

---

## Start Development Environment

```bash
docker compose up -d
```

This starts:

- PostgreSQL
- Mailpit

---

## Start Applications

```bash
pnpm dev
```

Applications

Frontend

```
http://localhost:3000
```

Backend

```
http://localhost:3001
```

Swagger

```
http://localhost:3001/docs
```

Mailpit

```
http://localhost:8025
```

---

## Development Services

| Service | Port |
|----------|------|
| Frontend | 3000 |
| Backend | 3001 |
| PostgreSQL | 5432 |
| Mailpit SMTP | 1025 |
| Mailpit UI | 8025 |

---

# 7. Docker Configuration

Docker provides a consistent development environment.

---

## Containers

Development stack includes:

- Frontend
- Backend
- PostgreSQL
- Mailpit

Future additions:

- Redis
- MinIO (Optional)
- Background Worker

---

## Docker Compose

Primary file

```text
docker-compose.yml
```

Development-specific overrides may use:

```text
docker-compose.override.yml
```

---

## Docker Principles

Each container should have:

- One responsibility
- Health checks
- Persistent volumes where required
- Restart policies

Applications should communicate using Docker networking.

---

# 8. Environment Variables

Configuration is managed using environment variables.

Never hardcode secrets.

---

## Backend

```env
NODE_ENV=development

PORT=3001

DATABASE_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

STORAGE_PROVIDER=local

EMAIL_PROVIDER=mailpit
```

---

## Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## Production

Production secrets should be stored securely.

Never commit:

- API Keys
- JWT Secrets
- Database Passwords
- SMTP Credentials

to version control.

# 9. Database Deployment

The platform uses PostgreSQL as its primary relational database.

---

## Development

Database runs inside Docker.

Configuration:

- PostgreSQL
- Persistent Docker Volume
- Local Network

---

## Staging

Recommended:

Managed PostgreSQL

or

Dedicated PostgreSQL Container

---

## Production

Recommended:

Managed PostgreSQL Service

Examples:

- DigitalOcean Managed PostgreSQL
- Railway PostgreSQL
- Supabase PostgreSQL
- AWS RDS PostgreSQL

Managed databases reduce operational overhead and improve reliability.

---

## Database Migrations

Every schema change must be deployed through Prisma Migrations.

Example:

```bash
pnpm prisma migrate deploy
```

Never modify the production database manually.

---

## Database Seeding

Development

```bash
pnpm prisma db seed
```

Seed data includes:

- Administrator
- Roles
- Permissions
- Workflow Templates
- Document Types

Production should never use development seed data.

---

## Backup Policy

Development

Not Required

Staging

Weekly

Production

Daily

Recommended retention:

```
30 Days
```

---

## Restore Testing

Database backups should be tested regularly.

A backup that cannot be restored is not considered a valid backup.

---

# 10. File Storage

Uploaded documents are stored separately from the application.

---

## Development

```
Local Storage
```

Example:

```text
/storage
```

---

## Production

Recommended:

```
Cloudflare R2
```

Alternative:

```
AWS S3
```

The Storage Provider abstraction allows changing providers without modifying business logic.

---

## File Structure

Example

```text
organization-id/

    applicant-id/

        document-id.pdf
```

Files are stored using generated identifiers.

Original filenames are stored only as metadata.

---

## Signed URLs

Files should never be publicly accessible.

Downloads use temporary signed URLs.

Default expiration:

```
5 Minutes
```

---

## Storage Backups

Cloud storage should be backed up regularly.

Critical documents should never exist in only one location.

---

# 11. Email Configuration

Emails are managed through the Email Provider.

---

## Development

Provider:

```
Mailpit
```

Emails remain inside the local environment.

---

## Production

Recommended:

```
Resend
```

Alternative:

```
Amazon SES
```

---

## Email Types

Examples:

- Portal Invitation
- Password Reset
- Document Request
- Workflow Update
- Task Assignment
- Notification

---

## Email Templates

Templates should be version controlled.

Templates should never be hardcoded inside services.

---

# 12. Reverse Proxy (Nginx)

Nginx serves as the public entry point.

Responsibilities:

- HTTPS
- SSL Termination
- Reverse Proxy
- Static Asset Delivery
- Compression
- Security Headers

---

## Traffic Flow

```text
Internet
     │
     ▼
Cloudflare
     │
     ▼
Nginx
     │
 ┌───┴───────────┐
 ▼               ▼
Frontend      Backend
```

---

## Compression

Enable:

- Gzip
- Brotli (Optional)

to reduce response size.

---

## Security Headers

Recommended:

- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy

---

# 13. SSL Configuration

Production deployments must enforce HTTPS.

---

## SSL Provider

Recommended:

```
Let's Encrypt
```

---

## Certificate Renewal

Certificates should renew automatically.

Recommended tool:

```
Certbot
```

---

## HTTP Redirect

Redirect:

```
HTTP

↓

HTTPS
```

No production traffic should use plain HTTP.

---

# 14. Production Deployment

Production deployments should be automated.

---

## Deployment Steps

1. Pull latest source code.

2. Install dependencies.

3. Build applications.

4. Run database migrations.

5. Restart services.

6. Verify health checks.

---

## Build Commands

```bash
pnpm install

pnpm build
```

---

## Database Migration

```bash
pnpm prisma migrate deploy
```

---

## Restart Containers

```bash
docker compose up -d --build
```

---

## Verify Deployment

Check:

- Frontend
- Backend
- Database
- Storage
- Email
- Health Endpoint

before marking deployment complete.

---

# 15. CI/CD Pipeline

Continuous Integration and Continuous Deployment reduce manual deployment effort.

---

## Recommended Platform

```
GitHub Actions
```

---

## Pipeline

```text
Push

↓

Install

↓

Lint

↓

Tests

↓

Build

↓

Docker Image

↓

Deploy

↓

Health Check
```

---

## Branch Strategy

Recommended:

```
main

development

feature/*
```

---

## Deployment Rules

- Feature branches deploy to development.
- Main deploys to staging.
- Production deployments require approval.

---

## Rollback

Every deployment should support rollback.

Rollback should restore:

- Application
- Database (if required)
- Configuration

with minimal downtime.

# 16. Monitoring & Logging

Monitoring ensures the platform remains healthy and available.

Logging assists with troubleshooting and auditing.

---

## Application Monitoring

Recommended monitoring includes:

- Application Availability
- API Response Time
- Database Health
- Storage Health
- Background Jobs
- Disk Usage
- Memory Usage
- CPU Usage

---

## Health Endpoints

The backend should expose a health endpoint.

Example:

```
GET /health
```

Response:

```json
{
    "status": "healthy"
}
```

Health checks should verify:

- Database Connection
- Storage Provider
- Email Provider
- Application Status

---

## Uptime Monitoring

Recommended:

- Uptime Kuma
- Better Stack
- Pingdom
- UptimeRobot

Alerts should be sent when the application becomes unavailable.

---

## Log Collection

Application logs should include:

- Timestamp
- Request ID
- User ID
- Organization ID
- HTTP Method
- Endpoint
- Status Code
- Response Time

Logs should be structured in JSON format.

---

## Log Retention

Suggested retention:

Development

```
7 Days
```

Production

```
90 Days
```

Audit logs may require longer retention based on organizational policies.

---

# 17. Backup Strategy

Backups protect against accidental deletion, hardware failures, and disasters.

---

## Database Backups

Production database backups should run automatically.

Schedule:

```
Daily
```

Retention:

```
30 Days
```

---

## File Storage Backups

Applicant documents should be backed up separately from the database.

Backups should include:

- Uploaded Files
- Metadata
- Version History

---

## Configuration Backups

Backup:

- Environment Variables
- Docker Compose Files
- Nginx Configuration
- SSL Certificates

Configuration backups should be encrypted.

---

## Backup Verification

Backups should be tested regularly.

Verification should include:

- Database Restore
- File Restore
- Configuration Restore

---

## Backup Storage

Backups should exist in at least two independent locations.

Example:

```
Primary Cloud Storage

+

Secondary Backup Storage
```

---

# 18. Disaster Recovery

Disaster recovery defines how the platform recovers from critical failures.

---

## Recovery Objectives

### Recovery Time Objective (RTO)

Target:

```
Less than 4 Hours
```

---

### Recovery Point Objective (RPO)

Target:

```
Less than 24 Hours
```

---

## Recovery Checklist

In case of disaster:

1. Provision new infrastructure.
2. Restore database.
3. Restore uploaded files.
4. Restore environment configuration.
5. Deploy latest application version.
6. Verify health checks.
7. Notify stakeholders.

---

## Disaster Scenarios

Examples:

- Database Failure
- Server Failure
- Storage Failure
- SSL Certificate Expiry
- DNS Failure
- Accidental Data Deletion

Each scenario should have documented recovery procedures.

---

# 19. Scaling Strategy

The deployment architecture should support future growth.

---

## Vertical Scaling

Increase:

- CPU
- RAM
- Storage

Suitable for early-stage deployments.

---

## Horizontal Scaling

Future deployments may use multiple application instances behind a load balancer.

Example:

```text
                    Load Balancer
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    Backend 1       Backend 2       Backend 3
```

---

## Stateless Applications

Application containers should remain stateless.

Persistent data belongs in:

- PostgreSQL
- Cloud Storage
- Redis (Future)

---

## CDN

Static assets should be delivered through a CDN.

Examples:

- Cloudflare
- AWS CloudFront

This improves performance for geographically distributed users.

---

# 20. Security Checklist

Before every production deployment, verify the following.

---

## Infrastructure

- Firewall Enabled
- SSH Restricted
- Root Login Disabled
- Automatic Security Updates Enabled

---

## Application

- HTTPS Enabled
- Environment Variables Configured
- Debug Mode Disabled
- Health Endpoint Verified

---

## Database

- Backups Enabled
- Migrations Applied
- Default Credentials Removed
- Strong Passwords Configured

---

## Storage

- Private Buckets
- Signed URLs Enabled
- File Validation Enabled

---

## Authentication

- Strong JWT Secrets
- Secure Cookies
- Password Hashing Verified
- RBAC Enabled

---

## Logging

- Audit Logging Enabled
- Error Logging Enabled
- Sensitive Data Not Logged

---

# 21. Maintenance

Regular maintenance keeps the platform secure and reliable.

---

## Weekly Tasks

- Review Error Logs
- Check Disk Usage
- Verify Backups
- Monitor Performance

---

## Monthly Tasks

- Apply Security Updates
- Review User Accounts
- Verify SSL Certificates
- Test Backup Restoration

---

## Quarterly Tasks

- Dependency Updates
- Infrastructure Review
- Performance Audit
- Security Audit

---

# 22. Deployment Checklist

Before every production deployment, complete the following checklist.

---

## Source Code

- Code Reviewed
- Tests Passed
- Build Successful

---

## Database

- Migration Verified
- Backup Completed

---

## Infrastructure

- Environment Variables Configured
- SSL Valid
- Health Checks Passing

---

## Deployment

- Application Built
- Containers Restarted
- Logs Reviewed

---

## Verification

Verify:

- Login
- Applicant Creation
- Document Upload
- Workflow Updates
- Email Delivery

Deployment is complete only after all critical functionality has been validated.

---

# 23. Future Infrastructure

As the platform evolves into a multi-tenant SaaS solution, additional infrastructure may be introduced.

Examples:

- Kubernetes
- Redis
- Message Queue
- Object Storage Replication
- CDN
- Auto Scaling
- Multi-Region Deployment
- Centralized Logging
- Metrics Dashboard
- Web Application Firewall (WAF)

The current deployment architecture is designed to support these enhancements with minimal changes.

---

# 24. Deployment Summary

The deployment architecture is designed to be:

- Secure
- Repeatable
- Scalable
- Reliable
- Cost-Effective
- Cloud-Ready

Core deployment decisions include:

- Docker-based Development
- Ubuntu Production Servers
- Nginx Reverse Proxy
- PostgreSQL
- Cloudflare R2 Storage
- GitHub Actions CI/CD
- Let's Encrypt SSL
- Automated Database Migrations
- Daily Backups
- Structured Monitoring
- Disaster Recovery Planning

These standards provide a robust operational foundation for deploying and maintaining the Document Workflow Platform from MVP through future SaaS expansion.

---

# End of Document