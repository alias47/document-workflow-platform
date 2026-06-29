# 12_UI_UX_GUIDELINES.md

# UI/UX Guidelines

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the User Interface (UI) and User Experience (UX) standards for the Document Workflow Platform.

Its purpose is to ensure a consistent, intuitive, and professional user experience across every part of the application.

The guidelines apply to:

- Consultant Dashboard
- Applicant Portal
- Administration Panel
- Shared Components
- Future Mobile Applications

This document serves as the primary reference for designers and frontend developers.

---

# 2. Design Philosophy

The platform follows a modern SaaS design philosophy.

The interface should feel:

- Professional
- Clean
- Fast
- Predictable
- Minimal
- Accessible

The design should emphasize usability over decoration.

Users spend hours working inside the application, therefore the interface must reduce cognitive load rather than increase it.

---

## Core Principles

### Simplicity

Every screen should focus on one primary objective.

Avoid unnecessary visual clutter.

---

### Consistency

The same action should always look and behave the same.

Buttons, forms, tables, colors, spacing, and interactions must remain consistent throughout the application.

---

### Efficiency

Consultants should complete common tasks with the fewest possible interactions.

Examples:

- Create Applicant
- Upload Documents
- Approve Documents
- Update Workflow

---

### Visibility

Important information should always be easy to find.

Examples:

- Pending Documents
- Missing Requirements
- Overdue Tasks
- Applicant Status

---

### Feedback

Every user action should provide immediate feedback.

Examples:

- Success Message
- Error Message
- Loading Indicator
- Progress Bar

---

# 3. User Experience Principles

The platform should support different user experiences for each role.

---

## Organization Administrator

Primary Goals

- Monitor Organization
- Manage Users
- View Reports
- Configure Settings

The dashboard should prioritize organizational visibility.

---

## Consultant

Primary Goals

- Manage Applicants
- Review Documents
- Track Workflow
- Complete Daily Tasks

The consultant dashboard should emphasize productivity.

---

## Applicant

Primary Goals

- Upload Documents
- View Progress
- Respond to Requests
- Track Status

The applicant portal should remain simple and focused.

Applicants should never be overwhelmed with unnecessary features.

---

# 4. Branding

The platform should project professionalism and trust.

Visual style should be:

- Modern
- Minimal
- Enterprise Ready

Avoid excessive branding elements that distract from the workflow.

---

## Logo Placement

Display the organization logo:

- Login Screen
- Sidebar
- Applicant Portal Header

Future versions may support organization-specific branding.

---

## Voice and Tone

Use clear and concise language.

Prefer:

"Upload Passport"

instead of

"Initiate Passport Documentation Submission"

Keep terminology understandable for non-technical users.

---

# 5. Color System

Colors communicate meaning.

They should never be used purely for decoration.

---

## Primary Color

Used for:

- Primary Buttons
- Links
- Active Navigation
- Key Actions

---

## Secondary Color

Used for:

- Secondary Actions
- Supporting UI Elements

---

## Success

Used for:

- Approved
- Completed
- Successful Actions

---

## Warning

Used for:

- Pending
- Missing Documents
- Attention Required

---

## Error

Used for:

- Rejected
- Validation Errors
- Failed Operations

---

## Neutral

Used for:

- Borders
- Backgrounds
- Disabled States
- Secondary Text

---

## Color Accessibility

Color should never be the only indicator of status.

Every colored status should include:

- Text
- Icon
- Badge

This improves accessibility.

# 6. Typography

Typography should prioritize readability and consistency.

---

## Font Family

Primary Font

```
Inter
```

Fallback

```
system-ui, sans-serif
```

Inter provides excellent readability for SaaS applications and aligns with modern design systems.

---

## Font Weights

| Weight | Usage |
|---------|-------|
| 400 | Body Text |
| 500 | Labels |
| 600 | Headings |
| 700 | Important Titles |

Avoid using excessive font weights.

---

## Font Sizes

| Element | Size |
|----------|------|
| Page Title | 32px |
| Section Title | 24px |
| Card Title | 20px |
| Heading | 18px |
| Body | 16px |
| Small Text | 14px |
| Caption | 12px |

Body text should never be smaller than 14px.

---

## Line Height

Recommended:

```
1.5
```

This improves readability, especially for long forms and tables.

---

## Text Rules

Avoid:

- ALL CAPS paragraphs
- Multiple font families
- Decorative fonts
- Excessive bold text

Prefer sentence case for headings and buttons.

Example:

✓ Create Applicant

✗ CREATE APPLICANT

---

# 7. Spacing System

Consistent spacing creates a clean and predictable interface.

The platform follows an 8-point spacing system.

---

## Base Unit

```
8px
```

---

## Standard Spacing Scale

| Value | Usage |
|---------|--------|
| 4px | Small Icon Gap |
| 8px | Between Labels |
| 16px | Form Fields |
| 24px | Cards |
| 32px | Sections |
| 48px | Large Layout Spacing |
| 64px | Page Sections |

Avoid arbitrary spacing values.

---

## Padding

Cards

```
24px
```

Dialogs

```
24px
```

Forms

```
24px
```

Tables

```
16px
```

---

## Margins

Maintain consistent vertical rhythm throughout the application.

Avoid stacking multiple margins unnecessarily.

---

# 8. Layout Guidelines

The layout should maximize usable workspace while remaining visually organized.

---

## Desktop Layout

```text
+--------------------------------------------------+
| Top Navigation                                   |
+------------+-------------------------------------+
| Sidebar    |                                     |
|            |                                     |
|            | Main Content                        |
|            |                                     |
|            |                                     |
+------------+-------------------------------------+
```

---

## Sidebar

Contains:

- Dashboard
- Applicants
- Documents
- Tasks
- Reports
- Settings

The sidebar should remain fixed during navigation.

---

## Top Navigation

Contains:

- Search
- Notifications
- User Menu
- Organization Switcher (Future)

---

## Content Area

The content area should prioritize readability.

Avoid excessive content width.

Recommended maximum width:

```
1440px
```

---

## Cards

Use cards to group related information.

Examples:

- Applicant Summary
- Recent Activity
- Statistics
- Workflow Overview

Cards should contain a clear title and sufficient whitespace.

---

# 9. Responsive Design

The platform should support:

- Desktop
- Laptop
- Tablet

The MVP does not prioritize mobile phones for consultants, but the applicant portal should remain mobile-friendly.

---

## Breakpoints

| Device | Width |
|----------|--------|
| Mobile | <640px |
| Tablet | 640–1024px |
| Desktop | >1024px |

---

## Desktop First

The consultant interface is designed desktop-first.

Reason:

Consultants primarily work on desktop or laptop computers.

---

## Applicant Portal

The applicant portal should support mobile devices.

Users should be able to:

- Upload Documents
- View Tasks
- Track Progress

from a smartphone without difficulty.

---

# 10. Navigation

Navigation should remain consistent across the platform.

---

## Sidebar Navigation

Primary navigation should include:

- Dashboard
- Applicants
- Documents
- Tasks
- Reports
- Settings

Only show items relevant to the current user's permissions.

---

## Breadcrumbs

Use breadcrumbs for deep navigation.

Example

```text
Applicants

>

John Doe

>

Documents
```

---

## Active Navigation

The current page should always be visually highlighted.

Users should never wonder where they are.

---

## Search

Provide global search for consultants.

Search should include:

- Applicants
- Documents
- Tasks

Future versions may include full-text search.

---

# 11. Forms

Forms should be easy to complete and minimize user errors.

---

## Layout

Prefer a single-column layout for most forms.

Use two columns only when space improves readability.

---

## Labels

Always display labels above input fields.

Example

```
Applicant Name

[______________]
```

Avoid placeholder-only labels.

---

## Required Fields

Required fields should display a visual indicator.

Example

```
First Name *
```

---

## Validation

Validation should occur:

- On Blur
- On Submit

Avoid excessive real-time validation while users are typing.

---

## Error Messages

Display error messages directly beneath the affected field.

Example

```
Email address is required.
```

Use clear and actionable language.

---

## Success Feedback

After successful submission:

- Show confirmation
- Keep messaging concise
- Redirect only when appropriate

Avoid unnecessary confirmation dialogs.

# 12. Tables

Tables are the primary interface for consultants managing applicants, documents, and workflows.

They should prioritize readability, scanning, and efficient data manipulation.

---

## Standard Table Features

Every major data table should support:

- Sorting
- Filtering
- Searching
- Pagination
- Column Visibility
- Row Selection
- Bulk Actions
- Sticky Headers

Recommended library:

```
TanStack Table
```

---

## Columns

Columns should display only essential information.

Example — Applicant List

| Column |
|----------|
| Applicant Name |
| Applicant ID |
| Assigned Consultant |
| Workflow Stage |
| Missing Documents |
| Last Updated |
| Status |
| Actions |

Avoid displaying unnecessary information.

---

## Row Actions

Common actions should appear in the last column.

Examples:

- View
- Edit
- Upload Documents
- View Timeline
- Archive

Avoid hiding frequently used actions inside dropdown menus.

---

## Bulk Actions

Bulk operations improve productivity.

Examples:

- Assign Consultant
- Archive Applicants
- Export
- Update Status

Bulk actions should only appear after rows have been selected.

---

## Empty Tables

Instead of showing an empty table, display a helpful message.

Example

```text
No applicants found.

Create your first applicant to get started.
```

Include a primary action button when appropriate.

---

# 13. Dashboard Design

The dashboard is the most frequently visited page.

It should answer one question:

"What needs my attention right now?"

---

## Organization Administrator Dashboard

Display:

- Total Applicants
- Active Consultants
- Pending Reviews
- Organization Activity
- Recent Logins
- Workflow Statistics

---

## Consultant Dashboard

Display:

- Assigned Applicants
- Pending Document Reviews
- Missing Documents
- Overdue Tasks
- Today's Activity
- Recent Timeline
- Upcoming Deadlines

The dashboard should help consultants prioritize work.

---

## Applicant Dashboard

Display:

- Profile Completion
- Current Workflow Stage
- Required Documents
- Missing Documents
- Recently Uploaded Documents
- Timeline
- Pending Requests

Keep the interface simple and focused.

---

## Dashboard Cards

Each card should display one key metric.

Examples:

```
145

Active Applicants
```

Avoid overcrowding cards with excessive details.

---

## Charts

Use charts only when they provide meaningful insights.

Recommended charts:

- Workflow Distribution
- Monthly Applicants
- Document Status
- Completion Rate

Avoid decorative charts.

---

# 14. Cards

Cards group related information.

---

## Usage

Examples:

- Applicant Summary
- Workflow Progress
- Dashboard Metrics
- Recent Activity
- Profile Information

---

## Card Structure

```text
-------------------------------

Title

Optional Description

-------------------------------

Content

-------------------------------

Footer (Optional)
```

---

## Spacing

Cards should have consistent padding.

Recommended:

```
24px
```

---

## Shadows

Use subtle shadows.

Avoid excessive elevation.

---

# 15. Buttons

Buttons communicate available actions.

---

## Primary Button

Used for the primary action.

Examples:

- Save
- Upload
- Create Applicant
- Approve

Only one primary button should exist within a major section.

---

## Secondary Button

Used for less important actions.

Examples:

- Cancel
- Back
- Preview

---

## Destructive Button

Used only for irreversible actions.

Examples:

- Delete
- Archive
- Remove

Destructive actions should require confirmation.

---

## Loading State

Buttons should display loading indicators during processing.

Example:

```
Uploading...
```

Disable repeated clicks while processing.

---

## Button Sizes

Standard sizes:

- Small
- Medium
- Large

Avoid introducing custom sizes.

---

# 16. Icons

Icons improve recognition but should not replace text.

---

## Icon Library

Recommended:

```
Lucide Icons
```

---

## Usage

Icons should accompany:

- Navigation
- Buttons
- Status Indicators
- Alerts
- Empty States

Avoid decorative icons.

---

## Consistency

Use a single icon style throughout the application.

Do not mix multiple icon libraries.

---

# 17. Status Indicators

Status indicators help users quickly understand workflow progress.

---

## Standard Statuses

Examples:

- Draft
- Pending
- In Review
- Approved
- Rejected
- Completed
- Archived

---

## Status Display

Every status should include:

- Color
- Text
- Optional Icon

Example

```
🟢 Approved
```

Do not rely solely on color.

---

## Workflow Progress

Workflow stages should use a progress stepper.

Example

```text
Submitted

↓

Documents Pending

↓

Review

↓

Completed
```

This gives users a clear understanding of their current progress.

---

# 18. Notifications

Notifications keep users informed without becoming distracting.

---

## Types

- Success
- Information
- Warning
- Error

---

## Placement

Recommended:

Top-right corner of the screen.

---

## Duration

Success notifications should disappear automatically.

Error notifications should remain visible until acknowledged or corrected.

---

## Examples

Success

```
Applicant created successfully.
```

Warning

```
Passport document is missing.
```

Error

```
Unable to upload document.
```

Information

```
Workflow updated successfully.
```

Keep notification messages concise and actionable.

# 19. Empty States

Empty states should guide users toward the next meaningful action instead of simply indicating that no data exists.

---

## Objectives

An effective empty state should:

- Explain why the page is empty.
- Tell the user what to do next.
- Provide a primary action whenever possible.

---

## Examples

### Applicants

```text
No applicants found.

Create your first applicant to begin managing documents.

[ Create Applicant ]
```

---

### Documents

```text
No documents uploaded.

Upload the requested documents to continue.

[ Upload Documents ]
```

---

### Tasks

```text
No pending tasks.

You're all caught up!
```

---

### Search Results

```text
No results found.

Try changing your search terms or filters.
```

---

## Illustration

Simple illustrations or icons may be used to improve clarity, but they should remain minimal and consistent with the platform's visual style.

---

# 20. Loading States

Loading states reassure users that the system is processing their request.

---

## Principles

Always display a loading indicator for operations lasting more than a few hundred milliseconds.

Avoid blank screens during data loading.

---

## Skeleton Loading

Use skeleton loaders instead of generic spinners whenever page content is loading.

Examples:

- Applicant List
- Dashboard Cards
- Document Tables
- Timeline

Skeletons reduce perceived waiting time.

---

## Progress Indicators

Long-running operations should display progress.

Examples:

- Document Upload
- Bulk Import
- Report Generation

---

## Loading Buttons

Buttons should indicate progress while preventing duplicate submissions.

Example:

```text
Uploading...
```

---

## Full Page Loading

Full-page loading screens should only be used during:

- Initial Application Load
- Authentication Verification
- Major Route Changes

---

# 21. Error States

Errors should help users recover rather than simply reporting failures.

---

## Principles

Every error message should:

- Clearly describe the problem.
- Explain why it occurred (if known).
- Suggest the next action.

---

## Examples

Good

```text
Unable to upload the document.

The file exceeds the maximum size of 10 MB.
```

Poor

```text
Upload failed.
```

---

## Validation Errors

Validation errors should appear directly beneath the affected field.

Avoid displaying validation messages only in toast notifications.

---

## System Errors

Unexpected errors should provide a friendly message.

Example

```text
Something went wrong.

Please try again or contact your consultant if the problem persists.
```

Avoid exposing technical details or stack traces to end users.

---

## Network Errors

Display retry options when possible.

Example

```text
Connection lost.

[ Retry ]
```

---

# 22. File Upload UX

Uploading documents is one of the platform's primary workflows.

The experience should be simple, reliable, and informative.

---

## Upload Methods

Support:

- Drag and Drop
- File Picker

Both methods should provide the same functionality.

---

## Upload Information

Before uploading, display:

- Accepted File Types
- Maximum File Size
- Number of Files Allowed

Example:

```text
Accepted:

PDF

JPG

PNG

Maximum Size:

10 MB
```

---

## Upload Progress

Display:

- Progress Bar
- Upload Percentage
- Upload Status

Users should never wonder whether an upload is still in progress.

---

## Upload Success

After a successful upload:

- Show a confirmation message.
- Refresh the document list.
- Update the workflow if applicable.

---

## Upload Failure

If an upload fails:

- Preserve the selected file.
- Display a clear error message.
- Allow the user to retry.

---

## File Preview

Where appropriate, allow users to preview uploaded files before submission.

---

# 23. Accessibility

Accessibility ensures that the platform can be used by as many people as possible.

Accessibility should be considered throughout development rather than added afterward.

---

## Keyboard Navigation

All interactive elements should be accessible using only the keyboard.

Users should be able to navigate without requiring a mouse.

---

## Focus Indicators

Every interactive element should display a visible focus state.

Never remove focus outlines without providing an accessible replacement.

---

## Screen Readers

Provide:

- Semantic HTML
- ARIA Labels
- Accessible Form Labels

Screen readers should accurately describe all interactive elements.

---

## Contrast

Text and interactive elements should maintain sufficient contrast against their backgrounds.

Avoid relying solely on color to communicate meaning.

---

## Images

Meaningful images should include descriptive alternative text.

Decorative images should use empty alt attributes.

---

# 24. Animation Guidelines

Animations should improve usability, not distract users.

---

## Principles

Animations should:

- Be subtle.
- Be fast.
- Reinforce user actions.

Avoid excessive or decorative motion.

---

## Recommended Durations

Small interactions:

```
150–200 ms
```

Dialogs:

```
200–300 ms
```

Page transitions:

```
250–350 ms
```

---

## Appropriate Uses

Examples:

- Opening Dialogs
- Dropdown Menus
- Toast Notifications
- Expandable Sections

Avoid unnecessary animations during routine navigation.

---

## Reduced Motion

Respect users' operating system preferences for reduced motion.

Disable non-essential animations when this preference is enabled.

---

# 25. Dark Mode (Future)

Dark mode is planned for future releases.

---

## Design Principles

Dark mode should not simply invert colors.

Each color should be intentionally selected to maintain readability and accessibility.

---

## Requirements

Support:

- Light Theme
- Dark Theme
- System Theme

Future branding should work consistently across all themes.

---

# 26. Design Tokens

The platform should centralize visual design decisions through reusable design tokens.

Examples include:

- Colors
- Typography
- Border Radius
- Shadows
- Spacing
- Animation Durations
- Breakpoints

Design tokens should be shared across all frontend applications.

---

## Benefits

- Consistency
- Easier Theme Management
- Reduced Duplication
- Improved Maintainability

---

# 27. UI Consistency Rules

To maintain a cohesive user experience, the following rules apply throughout the application.

---

## Components

Always use shared components.

Avoid creating duplicate implementations.

---

## Colors

Use only approved design tokens.

Do not introduce arbitrary colors.

---

## Typography

Use the defined typography scale consistently.

Avoid custom font sizes unless approved.

---

## Spacing

Follow the 8-point spacing system.

Avoid arbitrary margins and padding.

---

## Icons

Use only the approved icon library.

---

## Interactions

Similar actions should behave consistently across all pages.

Examples:

- Save
- Cancel
- Delete
- Upload
- Search

---

# 28. Future Design System

As the platform evolves, the design system may expand to include:

- Multi-Brand Support
- Organization Branding
- Theme Customization
- Mobile Design System
- Component Documentation
- Storybook Integration
- Advanced Data Visualization
- Interactive Prototypes

These enhancements should build upon the standards established in this document.

---

# 29. UI/UX Summary

The Document Workflow Platform follows a modern, professional SaaS design philosophy focused on simplicity, consistency, and usability.

Core design decisions include:

- Minimal Interface
- Desktop-First Consultant Experience
- Mobile-Friendly Applicant Portal
- Tailwind CSS
- shadcn/ui Component Library
- TanStack Table for Data Grids
- Lucide Icons
- 8-Point Spacing System
- Accessible Design
- Responsive Layouts
- Reusable Components
- Design Tokens
- Consistent User Feedback
- Workflow-Oriented Dashboards

By adhering to these guidelines, the platform will provide a consistent, intuitive, and scalable user experience while reducing development effort through a shared design language.

---

# End of Document