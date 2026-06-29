# 07_FRONTEND_ARCHITECTURE.md

# Frontend Architecture

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the frontend architecture of the Document Workflow Platform.

It establishes the standards, technologies, project structure, design principles, and development practices that every frontend developer should follow.

The frontend is designed to:

- Provide a fast and responsive user experience.
- Consume the REST API consistently.
- Support multiple user roles.
- Scale as new features are added.
- Maintain a consistent UI across the application.
- Minimize duplicated code.
- Support future mobile applications.

This document serves as the implementation blueprint for the Next.js application.

---

# 2. Frontend Goals

The frontend architecture is designed around the following goals.

## Simplicity

The codebase should remain easy to understand.

Avoid unnecessary abstractions.

Developers should be able to locate functionality quickly.

---

## Maintainability

Business features should be isolated.

Reusable components should minimize duplication.

Shared logic should exist only once.

---

## Scalability

The architecture should support:

- More users
- More organizations
- More features
- Future mobile applications
- White-label branding

without major refactoring.

---

## Performance

The application should feel fast.

Minimize unnecessary API calls.

Optimize rendering.

Use caching whenever possible.

---

## Security

Frontend security should complement backend security.

The frontend never replaces backend authorization.

Sensitive information should never be exposed to unauthorized users.

---

# 3. Technology Stack

The frontend uses modern React technologies optimized for long-term scalability.

| Technology | Purpose |
|------------|----------|
| Next.js 15 | React Framework |
| React 19 | UI Library |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| ShadCN UI | Component Library |
| TanStack Query | Server State |
| Zustand | Client State |
| React Hook Form | Forms |
| Zod | Validation |
| Axios | API Communication |
| React Dropzone | File Upload |
| React Table | Data Tables |
| React Hot Toast | Notifications |
| Heroicons | Icons |

---

# 4. Architectural Principles

The frontend follows these principles.

---

## Principle 1

Business logic belongs in feature modules.

---

## Principle 2

Components should remain small.

Each component should have one responsibility.

---

## Principle 3

Reuse components instead of duplicating code.

---

## Principle 4

API communication belongs in service layers.

Components should never call Axios directly.

---

## Principle 5

Forms should always use React Hook Form and Zod.

---

## Principle 6

Pages should compose features rather than contain business logic.

---

## Principle 7

Permissions should control the UI.

Buttons, menus, routes, and actions should all respect RBAC permissions.

---

## Principle 8

Server state and client state are separate concerns.

---

# 5. Application Architecture

```

Next.js App

│

├── App Router

├── Layouts

├── Features

├── Shared Components

├── Services

├── Providers

└── API

↓

NestJS REST API

↓

PostgreSQL

```

The frontend communicates only with the REST API.

It never accesses the database directly.

---

# 6. Folder Structure

```text
apps/web/

src/

├── app/
│
├── features/
│
│   ├── authentication/
│   ├── dashboard/
│   ├── applicants/
│   ├── documents/
│   ├── workflow/
│   ├── tasks/
│   ├── notes/
│   ├── notifications/
│   ├── settings/
│   └── organization/
│
├── components/
│
│   ├── ui/
│   ├── layouts/
│   ├── tables/
│   ├── forms/
│   ├── dialogs/
│   └── feedback/
│
├── hooks/
│
├── services/
│
├── providers/
│
├── lib/
│
├── utils/
│
├── types/
│
├── constants/
│
├── styles/
│
└── middleware.ts

```

---

# 7. Feature Module Structure

Each feature owns its own implementation.

Example

```text
features/

applicants/

├── api/

├── components/

├── hooks/

├── pages/

├── validation/

├── types/

├── utils/

└── index.ts

```

This structure keeps related files together.

Developers rarely need to leave a feature directory.

---

# 8. Routing Strategy

The project uses the Next.js App Router.

Example

```text
/

login

dashboard

applicants

applicants/[id]

documents

tasks

workflow

settings

organization

```

Every feature owns its own routes.

Protected routes require authentication.

---

# 9. Layout Architecture

The application uses nested layouts.

```text
Root Layout

│

├── Authentication Layout

│

└── Application Layout

├── Sidebar

├── Header

├── Breadcrumb

├── Notification Center

├── User Menu

└── Content Area

```

Every authenticated page shares the same layout.

This ensures UI consistency.

---

# 10. Navigation Structure

The primary navigation includes:

Dashboard

Applicants

Documents

Workflow

Tasks

Notifications

Organization

Settings

Profile

Logout

Navigation items are filtered according to user permissions.

A user should never see menu items they cannot access.

---
# 11. Authentication Flow

The frontend authenticates users using JWT Access Tokens and Refresh Tokens.

Two user types are supported:

- Staff
- Applicants

Applicants do not register themselves.

Applicant accounts are created by Staff through the platform.

---

## Authentication Flow

```text
Login Page

↓

POST /auth/login

↓

Access Token

+

Refresh Token

↓

Store Tokens

↓

Load Current User

↓

Load Permissions

↓

Redirect to Dashboard
```

---

## Token Storage

Access Token

- Stored in secure HTTP-only cookie

Refresh Token

- Stored in secure HTTP-only cookie

Authentication state is managed using Zustand.

---

## Session Recovery

When the application loads:

1. Validate Access Token
2. Refresh if expired
3. Load Current User
4. Load Permissions
5. Render Application

If refresh fails:

- Clear session
- Redirect to Login

---

# 12. Authorization (RBAC)

Authorization controls access to routes, components, and actions.

The frontend never replaces backend authorization.

It only improves the user experience.

---

## Permission Flow

```text
User

↓

Role

↓

Permissions

↓

Visible Routes

↓

Visible Components

↓

Allowed Actions
```

---

## Route Protection

Examples

Administrator

Can access

- Settings
- Users
- Organization

Consultant

Cannot access

- Organization Settings
- User Management

Applicants

Can only access

- Applicant Portal
- Documents
- Timeline
- Profile

---

## Component Protection

Components should hide unauthorized actions.

Example

```tsx
<Can permission="document.approve">
    <ApproveButton />
</Can>
```

---

## Route Middleware

Protected routes are validated using Next.js middleware.

Unauthenticated users are redirected to

```
/login
```

---

# 13. State Management

The frontend separates Server State from Client State.

---

## Server State

Managed using TanStack Query.

Examples

- Applicants
- Documents
- Tasks
- Workflow
- Notifications

Server State is automatically

- Cached
- Refetched
- Invalidated
- Synchronized

---

## Client State

Managed using Zustand.

Examples

- Sidebar
- Current User
- Theme
- Selected Applicant
- Filters
- Modals

---

## State Principles

Do not duplicate server data inside Zustand.

TanStack Query owns server state.

Zustand owns UI state.

---

# 14. API Layer

Every API call is isolated inside Service classes.

Components never call Axios directly.

---

## Structure

```text
services/

api/

axios.ts

authentication.service.ts

applicant.service.ts

document.service.ts

workflow.service.ts

task.service.ts
```

---

## Axios Configuration

Axios includes:

- Base URL
- Authentication
- Refresh Token Logic
- Error Handling
- Request Logging

---

## Request Flow

```text
Component

↓

Service

↓

Axios

↓

REST API

↓

Response

↓

TanStack Query

↓

Component
```

---

# 15. Data Fetching Strategy

Server Components fetch static data.

Client Components fetch interactive data.

---

## Server Components

Use for

- Dashboard Layout
- Settings
- Static Content

---

## Client Components

Use for

- Tables
- Forms
- Uploads
- Search
- Filters

---

## Caching

TanStack Query automatically caches

- Applicants
- Documents
- Dashboard
- Workflow

Cache invalidation occurs after

- Create
- Update
- Delete

---

# 16. Form Architecture

Every form follows the same structure.

---

## Technologies

- React Hook Form
- Zod

---

## Validation

Validation occurs

Frontend

↓

Backend

Never rely solely on frontend validation.

---

## Form Structure

```text
ApplicantForm

↓

Validation Schema

↓

React Hook Form

↓

API Service

↓

Success Toast

↓

Redirect
```

---

## Shared Components

Reusable inputs include

- Text Input
- Email Input
- Phone Input
- Date Picker
- Select
- Multi Select
- Checkbox
- Radio
- File Upload
- Rich Text Editor

Every form uses these shared components.

---

# 17. File Upload Architecture

The application supports secure file uploads.

---

## Upload Flow

```text
User

↓

Select File

↓

Validation

↓

Upload Progress

↓

REST API

↓

Storage Provider

↓

Database

↓

Success
```

---

## Validation

Validate

- File Type
- File Size
- Duplicate Uploads

before uploading.

---

## Upload Features

- Drag & Drop
- Progress Bar
- Cancel Upload
- Retry Upload
- Multiple Files
- Replace Existing File

---

## Preview

Supported previews

- PDF
- Images

Unsupported files display metadata only.

---

# 18. Component Architecture

Components are categorized by responsibility.

---

## UI Components

Pure presentation.

Examples

- Button
- Badge
- Input
- Avatar
- Card

---

## Feature Components

Contain business logic.

Examples

Applicant Table

Document List

Workflow Timeline

Task Board

---

## Layout Components

Shared application structure.

Examples

Sidebar

Header

Footer

Breadcrumb

---

## Dialog Components

Reusable dialogs.

Examples

Delete Confirmation

Approve Document

Reject Document

Create Applicant

Assign Consultant

---

## Table Components

Reusable tables.

Support

- Pagination
- Sorting
- Filtering
- Search
- Row Selection
- Bulk Actions
- Export

One table architecture should power every module.

---

# 19. UI Design System

The platform follows a centralized design system.

---

## Typography

Consistent typography scale.

- Headings
- Subheadings
- Body
- Labels
- Captions

---

## Spacing

Use an 8-point spacing system.

Examples

```
8px

16px

24px

32px

40px
```

---

## Colors

Defined using design tokens.

Examples

Primary

Secondary

Success

Warning

Danger

Info

Neutral

---

## Icons

Heroicons

Only one icon library should be used across the application.

---

## Components

Every reusable UI component belongs in

```
components/ui
```

No duplicated buttons, inputs, or dialogs should exist.

---

# 20. Theme & Branding

The platform supports organization branding.

Branding includes

- Logo
- Organization Name
- Primary Color
- Secondary Color
- Favicon

Organizations can customize branding without changing the application code.

---

## Theme Support

Supported themes

- Light
- Dark
- System Default

Dark mode can remain disabled during the MVP but the architecture supports future activation.

# 21. Error Handling

The frontend provides consistent error handling across the application.

Errors should always be informative without exposing sensitive system information.

---

## Error Categories

The application handles the following error types:

- Validation Errors
- Authentication Errors
- Authorization Errors
- Network Errors
- Server Errors
- Unexpected Errors

---

## Validation Errors

Display validation messages beside each form field.

Example

```
Email is required.

Password must contain at least 8 characters.
```

---

## Authentication Errors

If authentication fails:

1. Clear the current session.
2. Redirect the user to the Login page.
3. Display a session expired notification.

---

## Authorization Errors

If the user attempts an unauthorized action:

- Hide restricted UI elements whenever possible.
- Display an "Access Denied" page if a protected route is accessed directly.

---

## Network Errors

Display a retry option.

Example

```
Unable to connect to the server.

Please check your internet connection and try again.
```

---

## Global Error Boundary

React Error Boundaries should catch unexpected rendering errors.

Unexpected errors should:

- Display a friendly message.
- Log the error.
- Prevent the application from crashing.

---

# 22. Loading States

Every asynchronous operation should provide visual feedback.

---

## Loading Indicators

Use:

- Skeleton Loaders
- Loading Spinners
- Progress Bars
- Button Loading States

---

## Page Loading

Entire pages should display skeleton layouts instead of blank screens.

---

## Table Loading

Tables should use placeholder rows.

Avoid layout shifts during loading.

---

## Form Submission

While submitting:

- Disable the submit button.
- Show a loading indicator.
- Prevent duplicate submissions.

---

## File Upload

Display:

- Upload Progress
- Percentage Complete
- Upload Speed (optional)
- Cancel Upload button

---

# 23. Notification System

The application uses a centralized notification system.

---

## Notification Types

- Success
- Error
- Warning
- Information

---

## Examples

Success

```
Applicant created successfully.
```

Warning

```
Document is awaiting review.
```

Error

```
Unable to upload document.
```

---

## Toast Notifications

Short-lived actions use toast notifications.

Examples

- Save Successful
- Delete Successful
- Invitation Sent
- Workflow Updated

---

## Persistent Notifications

Long-term notifications appear inside the Notification Center.

Examples

- New Applicant Assigned
- Document Requires Review
- Overdue Task
- Workflow Completed

---

# 24. Dashboard Architecture

Dashboards aggregate multiple resources into a single view.

---

## Dashboard Widgets

Examples

- Applicant Statistics
- Workflow Progress
- Pending Documents
- Recent Activity
- Assigned Tasks
- Notifications
- Upcoming Deadlines

---

## Widget Principles

Each widget should:

- Load independently.
- Fail independently.
- Refresh independently.

One failing widget must never break the entire dashboard.

---

## Dashboard Refresh

Dashboard data should refresh automatically every:

```
60 seconds
```

Manual refresh should also be available.

---

# 25. Performance Optimization

Performance is a core architectural goal.

---

## Code Splitting

Load feature modules only when needed.

Use dynamic imports for:

- Large dialogs
- Charts
- Reports
- Rich Text Editor

---

## Lazy Loading

Lazy load:

- Images
- Large Components
- Secondary Pages

---

## Memoization

Use React memoization only where measurable improvements exist.

Avoid premature optimization.

---

## API Optimization

Minimize API calls by:

- Using Dashboard APIs.
- Caching responses.
- Invalidating only affected queries.

---

## Pagination

Never load entire datasets.

Large resources should always use server-side pagination.

---

## Virtualization

Large tables should use virtualization.

Recommended threshold:

```
500+ rows
```

---

# 26. Accessibility

The platform should be accessible to all users.

---

## Accessibility Standards

Follow WCAG 2.1 AA guidelines where practical.

---

## Keyboard Navigation

Every interactive component must support keyboard interaction.

---

## Screen Readers

Provide:

- Labels
- ARIA attributes
- Meaningful button text

---

## Color Contrast

UI colors must meet accessibility contrast requirements.

Color should never be the only indicator of status.

---

## Focus Management

Visible focus indicators should always be present.

Dialogs should trap keyboard focus until closed.

---

# 27. Security

Frontend security complements backend security.

---

## Authentication

Never expose tokens through JavaScript if using HTTP-only cookies.

---

## Authorization

Frontend permissions improve UX only.

Backend authorization remains the source of truth.

---

## XSS Prevention

Never render unsanitized HTML.

Escape user-generated content by default.

---

## CSRF Protection

When using cookies for authentication, implement CSRF protection.

---

## Sensitive Data

Never store:

- Passwords
- Access Tokens (in localStorage)
- Refresh Tokens (in localStorage)

---

## Environment Variables

Only expose variables prefixed for client-side use.

Secrets must remain on the server.

---

# 28. Future Mobile Support

The frontend architecture supports future mobile applications.

Future clients include:

- iOS
- Android

Both clients will consume the same REST API.

Business logic remains in the backend.

---

## Shared Contracts

Shared API contracts ensure consistency between:

- Web
- Mobile
- Third-party Integrations

---

# 29. Development Standards

Every frontend developer should follow these standards.

---

## Code Style

- Use TypeScript.
- Prefer functional components.
- Avoid duplicated logic.
- Write descriptive variable names.

---

## Component Naming

Examples

```
ApplicantTable

CreateApplicantDialog

DocumentUploadCard

WorkflowTimeline
```

---

## File Naming

Use PascalCase for components.

Use camelCase for hooks and utilities.

Examples

```
ApplicantTable.tsx

useApplicants.ts

formatDate.ts
```

---

## Imports

Group imports in the following order:

1. External libraries
2. Shared packages
3. Internal modules
4. Relative imports

---

## Comments

Prefer self-documenting code.

Add comments only when explaining business rules or complex logic.

---

## Testing

Future frontend tests should include:

- Unit Tests
- Component Tests
- Integration Tests
- End-to-End Tests

Recommended tools:

- Vitest
- React Testing Library
- Playwright

---

# Frontend Architecture Summary

The frontend architecture is designed to be:

- Modular
- Scalable
- Secure
- Performant
- Maintainable
- Accessible
- Consistent

Core architectural decisions include:

- Next.js App Router
- Feature-based architecture
- TypeScript
- TanStack Query
- Zustand
- React Hook Form
- Zod Validation
- ShadCN UI
- Tailwind CSS
- REST API integration
- Role-Based Access Control
- Shared Design System

These standards provide a strong foundation for building a modern, enterprise-grade web application that can evolve into a multi-tenant SaaS platform with minimal architectural changes.

---

# End of Document