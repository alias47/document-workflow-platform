# 00_MVP.md

# MVP Charter

**Project:** Document Workflow Platform (Working Title)

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# Purpose

This document defines the scope of the Minimum Viable Product (MVP).

The purpose of the MVP is to validate the product with a real organization before investing in advanced SaaS features.

This document acts as the source of truth for what is included and excluded from the first release.

---

# Product Vision

Build a modern web application that enables organizations to collect, manage, review, and track applicant documents through a centralized workflow.

Although the first pilot customer is expected to be an education consultancy, the platform architecture should remain generic so it can later support industries such as recruitment, immigration, insurance, finance, and HR.

---

# Problem Statement

Organizations currently rely on a combination of:

* WhatsApp
* Email
* Google Drive
* Excel
* Physical paperwork

This results in:

* Lost documents
* Duplicate files
* Poor communication
* Manual follow-ups
* No approval history
* No centralized workflow
* Difficult collaboration

The platform aims to replace these fragmented tools with a single, organized workspace.

---

# Goals

The MVP should allow an organization to:

* Manage applicants
* Collect required documents
* Review submitted documents
* Track applicant progress
* Maintain a complete activity history

---

# Success Criteria

The MVP will be considered successful when:

* One organization actively uses the platform.
* Applicants can upload documents without staff assistance.
* Agents can review and approve documents efficiently.
* Applicant progress can be tracked from one dashboard.
* The organization significantly reduces reliance on WhatsApp, email, and Google Drive for document collection.

---

# Target Users

## Organization Admin

Responsibilities

* Manage users
* Manage applicants
* Configure document requirements
* View dashboard
* Monitor workflow

---

## Agent

Responsibilities

* Review applicants
* Review documents
* Approve or reject submissions
* Add notes
* Move applicants through workflow stages

---

## Applicant

Responsibilities

* Login
* Upload documents
* Replace documents
* Track application status
* View comments and timeline

---

# MVP Features

## Authentication

### Included

* Login
* Logout
* Forgot Password
* Change Password

### Excluded

* Social Login
* Multi-Factor Authentication
* Single Sign-On (SSO)

---

## Dashboard

### Included

* Total Applicants
* Pending Documents
* Approved Documents
* Recent Activity

### Excluded

* Analytics
* Reports
* AI Insights
* Custom Widgets

---

## Applicant Management

### Included

* Create Applicant
* Edit Applicant
* Archive Applicant
* Search Applicants
* Applicant Profile

### Excluded

* Bulk Import
* CRM Features
* Marketing Automation

---

## Document Management

### Included

* Upload Documents
* Replace Documents
* Preview Documents
* Download Documents
* Approve Documents
* Reject Documents
* Reviewer Comments

### Excluded

* OCR
* AI Validation
* Digital Signature
* File Comparison
* Watermarking

---

## Workflow

### Included

Simple workflow:

New Applicant

↓

Documents Pending

↓

Documents Under Review

↓

Documents Completed

### Excluded

* Workflow Builder
* Conditional Rules
* Automation Engine
* Multiple Workflows

---

## Timeline

Automatically record:

* Applicant Created
* Document Uploaded
* Document Approved
* Document Rejected
* Note Added

---

## Notes

Internal notes between organization users.

Applicants cannot view internal notes.

---

## Notifications

### Included

* In-App Notifications

### Excluded

* Email Notifications
* SMS
* Push Notifications

---

## Applicant Portal Access

The Applicant Portal is a secure self-service portal that is **provisioned by the consultancy**. Applicants do not register or create their own accounts.

When a consultant creates an applicant profile, the system automatically creates a portal account, generates a temporary password, and sends an invitation to the applicant.

On first login, the applicant is required to change their password before accessing the portal.

### Included

* Login using system-generated credentials
* Mandatory password change on first login
* Dashboard
* Upload Documents
* Replace Rejected Documents
* View Document Status
* View Application Progress
* View Timeline
* View Consultant Requests

### Excluded

* Self Registration
* Messaging
* Appointment Booking
* Payments
* Online Application Submission

---

# Functional Requirements

The system shall allow:

### Staff

* Secure authentication using email and password.
* Administrators to manage staff accounts.
* Consultants to create applicant profiles.
* Consultants to automatically provision applicant portal accounts.
* Consultants to review uploaded documents.
* Consultants to approve or reject documents.
* Staff to manage applicant workflows.
* Staff to view audit logs.

### Applicants

* Login using credentials provided by the consultancy.
* Change their password on first login.
* Upload required documents.
* Replace rejected documents.
* View document status.
* View application progress.
* View activity timeline.
* Securely access only their own information.

### System

* Automatically generate temporary passwords for new applicant accounts.
* Send invitation emails to newly created applicants.
* Store uploaded documents securely.
* Record all important activities in an audit log.
* Enforce role-based access control.
* Prevent unauthorized access to applicant data.

---

# Non-Functional Requirements

* Responsive Design
* Secure Authentication
* Mandatory Password Change on First Login (Applicants)
* Role-Based Access Control (RBAC)
* JWT-Based Authentication
* RESTful API
* Secure File Storage
* Audit Logging
* Docker-Based Local Development
* Cloud-Ready Architecture
* Mobile-Ready API Architecture
* Scalable Multi-Tenant Architecture (Future)

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

## Backend

* NestJS
* Prisma ORM
* PostgreSQL

## File Storage

* Cloudflare R2

## Authentication

* JWT
* Refresh Tokens

## Deployment

* Docker

---

# Out of Scope (Post-MVP)

The following features are intentionally postponed until after the pilot:

* Multi-tenancy
* White-label branding
* Billing & Subscription Management
* Custom Domains
* Mobile Applications
* AI Document Recognition
* OCR
* Public API
* Third-Party Integrations
* Plugin Marketplace
* Advanced Reporting
* Workflow Builder
* Role Builder
* Localization
* Audit Reports
* Analytics Dashboard

---

# Acceptance Criteria

The MVP is complete when:

* Users can authenticate successfully.
* Admins can manage applicants.
* Applicants can upload required documents.
* Agents can review and approve submissions.
* Applicants can view approval status.
* Timeline records important events.
* The application is deployed and actively used by at least one organization.

---

# Post-MVP Roadmap

## Phase 2

* Multi-Organization Support
* White-Label Branding
* Organization Settings
* Configurable Document Types
* Configurable Workflows

## Phase 3

* Subscription Plans
* Billing
* Organization Self-Onboarding
* Feature Flags

## Phase 4

* Mobile Applications
* Push Notifications
* Offline Support

## Phase 5

* AI Document Validation
* OCR
* Analytics
* Reporting
* Automation

---

# Architecture Decision

Although the MVP targets a single organization, the backend must use generic domain terminology to support future expansion.

Examples:

| Backend Entity | UI Label (Education) | Future UI Label          |
| -------------- | -------------------- | ------------------------ |
| Applicant      | Student              | Candidate / Customer     |
| Agent          | Counselor            | Recruiter / Case Manager |
| Workflow       | Admission Process    | Hiring Process           |
| Document       | Passport             | Any Required File        |

This allows the platform to evolve into a true white-label SaaS without requiring major backend refactoring.

---

# Guiding Principle

> Build the smallest product that solves a real business problem for one organization while laying a clean architectural foundation for future growth.

Whenever a new feature is proposed, ask:

**"Does this help validate the MVP, or can it wait until after the pilot?"**

If it does not directly contribute to the pilot's success, it belongs in the backlog.
