# 13_COMPONENT_LIBRARY.md

# Component Library

**Project:** Document Workflow Platform

**Version:** 1.0

**Status:** Draft

**Last Updated:** June 2026

---

# 1. Purpose

This document defines the official UI component library for the Document Workflow Platform.

The purpose of the component library is to ensure that every screen is built using reusable, consistent, and accessible components.

A shared component library provides:

- Consistent User Experience
- Faster Development
- Reduced Code Duplication
- Easier Maintenance
- Better Accessibility
- Simplified Testing

Every frontend developer should use existing components before creating new ones.

---

# 2. Design System Stack

The platform uses the following frontend technologies.

| Layer | Technology |
|---------|------------|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui |
| Accessibility | Radix UI |
| Icons | Lucide React |
| Tables | TanStack Table |
| Forms | React Hook Form |
| Validation | Zod |
| Charts | Recharts |

These technologies form the official design system.

---

# 3. Component Principles

Every component should follow these principles.

---

## Reusable

A component should be reusable across multiple pages whenever practical.

---

## Composable

Components should support composition rather than inheritance.

---

## Accessible

Every component should meet accessibility requirements.

Examples:

- Keyboard Navigation
- Focus Management
- Screen Readers
- ARIA Labels

---

## Configurable

Components should expose configurable properties instead of requiring duplicate implementations.

---

## Stateless

Whenever possible, components should remain stateless.

Business logic belongs inside feature components or hooks.

---

## Responsive

Components should adapt naturally across supported screen sizes.

---

## Consistent

Components should use the shared:

- Typography
- Colors
- Spacing
- Animations
- Icons

No component should introduce its own design language.

---

# 4. Component Organization

The frontend follows a Feature-Sliced Design (FSD) architecture.

```text
src/

├── app/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

Shared UI components should never depend on business logic.

Business-specific components belong within their corresponding feature.

---

# 5. Component Folder Structure

```text
src/

shared/

├── ui/
│
├── components/
│
├── hooks/
│
├── lib/
│
├── utils/
│
├── constants/
│
└── types/

features/

├── applicants/
├── documents/
├── workflow/
├── authentication/
├── dashboard/
└── settings/
```

Business components should remain inside feature folders.

Reusable UI belongs inside `shared/ui`.

---

# 6. Component Naming Convention

Use descriptive names.

Good examples:

- ApplicantCard
- StatusBadge
- WorkflowStepper
- DocumentUploader
- ConfirmationDialog
- UserAvatar

Avoid:

- Card2
- NewModal
- Upload1
- TempTable

Component names should clearly describe their purpose.

---

# 7. Standard Component Structure

Complex components should follow a predictable structure.

Example:

```text
ApplicantCard

├── ApplicantCardHeader
├── ApplicantCardContent
└── ApplicantCardFooter
```

This pattern aligns with shadcn/ui and improves readability.

---

# 8. Standard Component Props

Where applicable, components should support consistent props.

Common props include:

```typescript
variant

size

disabled

loading

className

children
```

Avoid introducing inconsistent prop names across similar components.

---

# 9. Styling Rules

Components should use:

- Tailwind CSS
- Design Tokens
- Utility Classes

Avoid:

- Inline Styles
- Hardcoded Colors
- Fixed Widths
- Magic Numbers

All visual styles should originate from the shared design system.

---

# 10. Component Categories

The platform organizes components into the following categories.

- Inputs
- Navigation
- Data Display
- Feedback
- Overlays
- Workflow
- Dashboard
- File Management
- Layout

Each category is documented in the following sections.

# 11. Button

Buttons represent the primary way users interact with the platform.

---

## Variants

Supported variants:

- Primary
- Secondary
- Outline
- Ghost
- Destructive
- Link

---

## Sizes

Supported sizes:

- Small
- Medium
- Large
- Icon

---

## States

Every button should support:

- Default
- Hover
- Focus
- Active
- Disabled
- Loading

---

## Loading State

Disable interaction while loading.

Example:

```
Uploading...
```

---

## Icons

Icons may appear:

- Left
- Right

Avoid icon-only buttons unless universally recognizable.

Examples:

- Search
- Settings
- Close

---

## Usage

Primary buttons should represent the most important action on the page.

Avoid displaying multiple primary buttons within the same section.

---

# 12. Input

Input fields collect user information.

---

## Standard Inputs

Supported:

- Text
- Email
- Password
- Number
- Search

---

## Required Elements

Every input should include:

- Label
- Placeholder (Optional)
- Help Text (Optional)
- Validation Message

---

## States

- Default
- Focus
- Disabled
- Error
- Success

---

## Validation

Display validation beneath the input.

Example:

```
Email is required.
```

---

# 13. Textarea

Textareas support longer text input.

Examples:

- Internal Notes
- Applicant Remarks
- Document Comments

---

## Features

- Auto Resize
- Character Counter (Optional)
- Validation
- Disabled State

---

# 14. Select

Select components provide predefined options.

Examples:

- Workflow Stage
- Country
- Status
- Assigned Consultant

---

## Features

Support:

- Search (when applicable)
- Keyboard Navigation
- Disabled Options
- Validation

---

# 15. Combobox

Comboboxes combine searching with selection.

Examples:

- Applicant Search
- Consultant Search
- Organization Search

---

## Features

- Type Ahead
- Keyboard Navigation
- Empty Results
- Loading State

---

# 16. Checkbox

Checkboxes represent multiple selections.

Examples:

- Permissions
- Filters
- Bulk Selection

---

## States

- Checked
- Unchecked
- Disabled
- Indeterminate

---

# 17. Radio Group

Radio Groups allow one selection from multiple options.

Examples:

- Gender
- Theme Selection
- Document Type

Only one option may be selected.

---

# 18. Switch

Switches represent binary settings.

Examples:

- Notifications
- Dark Mode (Future)
- Active User

Avoid using switches for destructive actions.

---

# 19. Date Picker

Date pickers standardize date selection.

Examples:

- Date of Birth
- Application Date
- Deadline

---

## Features

Support:

- Calendar Picker
- Keyboard Navigation
- Date Validation

---

# 20. File Upload

File Upload is one of the platform's most important components.

---

## Supported Methods

- Drag and Drop
- File Browser

---

## Features

Support:

- Progress Bar
- Upload Percentage
- Retry
- Remove
- Preview
- Replace File

---

## Validation

Display:

- Accepted Formats
- Maximum File Size
- Validation Errors

---

## Upload States

- Waiting
- Uploading
- Uploaded
- Failed

---

# 21. Avatar

Avatars identify users.

---

## Variants

- Image
- Initials
- Placeholder

---

## Sizes

- Small
- Medium
- Large

---

## Usage

Used for:

- Consultants
- Applicants
- Administrators

---

# 22. Badge

Badges display concise information.

Examples:

- Pending
- Approved
- Rejected
- Admin
- Consultant

---

## Variants

- Success
- Warning
- Error
- Secondary
- Outline

Badges should never replace full status information.

---

# 23. Alert

Alerts display important information.

---

## Types

- Success
- Warning
- Error
- Information

---

## Usage

Examples:

- System Maintenance
- Missing Documents
- Workflow Warnings

Alerts should remain visible until dismissed when appropriate.

---

# 24. Toast

Toasts provide temporary feedback.

---

## Usage

Examples:

- Applicant Created
- Document Uploaded
- Changes Saved

---

## Duration

Recommended:

```
3–5 Seconds
```

---

## Position

Top-right corner.

Avoid stacking excessive notifications.

---

# 25. Dialog

Dialogs interrupt the current workflow for important actions.

---

## Examples

- Delete Applicant
- Approve Document
- Reject Document
- Confirmation

---

## Structure

```text
Header

Content

Actions
```

---

## Rules

Dialogs should remain focused on a single decision.

Avoid large forms inside dialogs whenever possible.

# 26. Drawer

Drawers provide contextual interfaces without leaving the current page.

They slide into view while preserving the user's current context.

---

## Usage

Examples:

- View Applicant Summary
- Edit Profile
- Quick Document Preview
- Notification Center

---

## Placement

Supported positions:

- Right (Preferred)
- Left
- Bottom (Mobile)

---

## Structure

```text
Header

Content

Footer (Optional)
```

---

## Rules

Use drawers for lightweight workflows.

Avoid using drawers for complex multi-step forms.

---

# 27. Sheet

Sheets display supporting content without interrupting the user's workflow.

Unlike dialogs, sheets are intended for secondary tasks.

---

## Examples

- Advanced Filters
- Activity Timeline
- Recent Notifications
- Applicant Details

---

## Guidelines

Sheets should:

- Be dismissible
- Preserve page state
- Avoid blocking primary workflows

---

# 28. Card

Cards group related information into easily scannable sections.

---

## Usage

Examples:

- Applicant Summary
- Dashboard Metrics
- Workflow Overview
- Recent Activity

---

## Structure

```text
Card

├── Header
├── Description (Optional)
├── Content
└── Footer (Optional)
```

---

## Guidelines

Cards should:

- Have consistent spacing
- Contain one primary purpose
- Avoid unnecessary nested cards

---

# 29. Tabs

Tabs organize related content without requiring navigation to another page.

---

## Examples

Applicant Details

- Overview
- Documents
- Timeline
- Notes

---

## Guidelines

- Keep labels short.
- Maintain the selected tab when refreshing data.
- Avoid more than seven tabs in a single interface.

---

# 30. Accordion

Accordions progressively disclose information.

---

## Examples

- Frequently Asked Questions
- Document Requirements
- Advanced Settings

---

## Guidelines

Only use accordions when collapsing content significantly improves readability.

Avoid nesting accordions inside other accordions.

---

# 31. Breadcrumb

Breadcrumbs help users understand their location within the application.

---

## Example

```text
Dashboard

>

Applicants

>

John Doe

>

Documents
```

---

## Rules

- Always begin with Dashboard.
- Display the current page as the final item.
- The current page should not be clickable.

---

# 32. Sidebar

The sidebar provides primary application navigation.

---

## Primary Navigation

- Dashboard
- Applicants
- Documents
- Workflow
- Reports
- Settings

---

## Behavior

- Fixed on desktop.
- Collapsible.
- Permission-aware.
- Highlight active page.

---

## Future

Support:

- Organization Switcher
- Favorites
- Recently Visited Pages

---

# 33. Navbar

The top navigation bar provides global actions.

---

## Contents

- Search
- Notifications
- Theme Switcher (Future)
- User Menu
- Organization Selector (Future)

---

## Behavior

Remain fixed while scrolling.

The navbar should never contain page-specific actions.

---

# 34. Search Bar

Search is a core productivity feature.

---

## Features

Support:

- Instant Search
- Keyboard Navigation
- Search History (Future)
- Debounced Requests

---

## Search Scope

Consultants should be able to search:

- Applicants
- Documents
- Tasks
- Consultants (Administrator)

---

## Empty Results

Provide helpful suggestions instead of simply displaying:

```text
No results found.
```

---

# 35. Data Table

Data tables display structured business data.

---

## Official Library

```
TanStack Table
```

---

## Standard Features

Every table should support:

- Sorting
- Filtering
- Pagination
- Column Visibility
- Row Selection
- Bulk Actions
- Sticky Headers
- Loading Skeletons

---

## Standard Tables

Examples:

- ApplicantTable
- DocumentTable
- UserTable
- WorkflowTable
- AuditLogTable

---

## Empty State

Replace empty tables with an informative message and a clear primary action.

---

# 36. Pagination

Pagination improves performance and usability.

---

## Features

Support:

- Page Navigation
- Page Size Selection
- Total Record Count
- First / Last Page
- Previous / Next Page

---

## Default Page Size

Recommended:

```
25 rows
```

Allow users to change the page size when appropriate.

---

# 37. Filters

Filters help users locate relevant information quickly.

---

## Examples

Applicants

- Status
- Assigned Consultant
- Country
- Intake
- Date Created

---

Documents

- Status
- Type
- Upload Date

---

## Guidelines

Display active filters clearly.

Users should be able to remove filters individually or clear all filters with a single action.

---

# 38. Status Badge

Status badges provide consistent visual feedback.

---

## Standard Statuses

- Draft
- Pending
- In Review
- Approved
- Rejected
- Completed
- Archived

---

## Appearance

Every badge should include:

- Color
- Text
- Optional Icon

Do not rely solely on color to communicate status.

---

# 39. Progress

Progress components communicate task completion.

---

## Examples

- Profile Completion
- Workflow Progress
- File Upload
- Bulk Import

---

## Types

- Linear Progress Bar
- Circular Progress Indicator
- Percentage Label

---

## Guidelines

Progress indicators should always represent measurable completion.

Avoid indefinite progress indicators unless the completion time is unknown.

---

# 40. Timeline

Timelines display chronological activity.

---

## Examples

Applicant Timeline

- Applicant Created
- Portal Invitation Sent
- Portal Activated
- Document Uploaded
- Document Approved
- Workflow Updated

---

## Structure

```text
Timestamp

↓

Activity

↓

User

↓

Details
```

---

## Guidelines

Timeline entries should always display:

- Date and Time
- User
- Action
- Optional Details

Entries should appear in reverse chronological order.

# 41. Workflow Stepper

The Workflow Stepper provides users with a visual representation of an applicant's progress.

It helps consultants and applicants understand the current stage and remaining steps.

---

## Standard Workflow

```text
Application Created

↓

Documents Requested

↓

Documents Uploaded

↓

Documents Reviewed

↓

Application Submitted

↓

Decision Received

↓

Completed
```

---

## Features

The Workflow Stepper should support:

- Current Stage Highlight
- Completed Stages
- Upcoming Stages
- Stage Descriptions
- Completion Percentage (Optional)

---

## Appearance

Each stage should display:

- Icon
- Title
- Status
- Timestamp (Optional)

---

## Rules

Workflow stages should only move forward unless explicitly reverted by an authorized user.

---

# 42. Empty State

Empty states should guide users toward meaningful actions.

---

## Structure

Each empty state should include:

- Illustration or Icon
- Title
- Description
- Primary Action
- Secondary Action (Optional)

---

## Examples

Applicants

```text
No applicants found.

Create your first applicant to begin managing applications.

[ Create Applicant ]
```

---

Documents

```text
No documents uploaded.

Upload documents to continue the workflow.

[ Upload Documents ]
```

---

Tasks

```text
You're all caught up!

There are no pending tasks.
```

---

Search

```text
No matching results.

Try changing your search terms or filters.
```

---

# 43. Loading Skeleton

Loading Skeletons provide visual placeholders while data is loading.

They improve perceived performance compared to traditional loading spinners.

---

## Usage

Use skeletons for:

- Dashboard Cards
- Applicant Lists
- Document Tables
- Timeline
- Profile Pages
- Reports

---

## Guidelines

Skeletons should closely resemble the final layout.

Avoid displaying empty white screens while loading.

---

## Do Not Use

Avoid skeletons for:

- Very short operations (<300ms)
- Button loading states
- File upload progress

---

# 44. Charts

Charts visualize trends and statistics.

Charts should communicate information clearly rather than decorate the interface.

---

## Official Library

```
Recharts
```

---

## Approved Chart Types

- Bar Chart
- Line Chart
- Area Chart
- Pie Chart
- Donut Chart

---

## Dashboard Charts

Examples

- Monthly Applicants
- Workflow Distribution
- Document Status
- Consultant Workload
- Application Trends

---

## Rules

Avoid:

- 3D Charts
- Excessive Colors
- Decorative Animations
- More than one primary insight per chart

Every chart should include:

- Title
- Labels
- Legend (when applicable)

---

# 45. Forms

Forms are one of the most frequently used interfaces within the platform.

---

## Official Libraries

Forms

```
React Hook Form
```

Validation

```
Zod
```

---

## Form Structure

Every form should include:

- Title
- Description (Optional)
- Fields
- Validation Messages
- Submit Button
- Cancel Button

---

## Layout

Prefer single-column forms.

Use two columns only when it improves readability.

---

## Validation

Validation should occur:

- On Blur
- On Submit

Avoid validating every keystroke unless necessary.

---

## Error Messages

Display validation messages directly below the corresponding field.

Example

```
Email address is required.
```

---

## Submission

While submitting:

- Disable the Submit button.
- Display a loading state.
- Prevent duplicate submissions.

---

# 46. Accessibility Rules

Accessibility is a core requirement for every component.

---

## Keyboard Support

All interactive components must support keyboard navigation.

---

## Focus Management

Visible focus indicators are mandatory.

Never remove focus outlines without providing an accessible alternative.

---

## Screen Readers

Every component should include:

- Semantic HTML
- ARIA Labels
- Accessible Form Labels

---

## Color

Never rely solely on color to communicate information.

Use:

- Icons
- Labels
- Status Text

---

## Contrast

Maintain WCAG AA minimum contrast requirements throughout the application.

---

## Motion

Respect the user's operating system preference for reduced motion.

---

# 47. Component Naming Convention

Components should follow a consistent naming convention.

---

## Shared Components

Examples

```
Button

Input

Card

Badge

Dialog

DataTable
```

---

## Business Components

Examples

```
ApplicantCard

ApplicantTable

DocumentUploader

WorkflowStepper

StatusBadge

Timeline

StatisticsCard
```

---

## Naming Rules

Use:

- PascalCase
- Descriptive Names
- Singular Names where appropriate

Avoid:

```
Card1

TableNew

Modal2

TestButton
```

---

# 48. Component Folder Structure

The component library should follow a consistent folder structure.

```text
src/

shared/

├── ui/
│
├── components/
│
├── hooks/
│
├── lib/
│
├── utils/
│
└── types/

features/

├── applicants/
├── documents/
├── workflow/
├── dashboard/
├── authentication/
└── settings/
```

---

## Rules

- Shared UI components belong in `shared/ui`.
- Feature-specific components belong within their feature.
- Business logic should never exist inside shared UI components.

---

# 49. Storybook (Future)

As the platform grows, Storybook should become the primary environment for documenting and testing UI components in isolation.

---

## Benefits

- Component Documentation
- Interactive Development
- Visual Regression Testing
- Faster Designer–Developer Collaboration
- Easier QA Testing

---

## Scope

Every reusable component should eventually include:

- Documentation
- Interactive Examples
- Supported Variants
- Accessibility Notes
- Usage Guidelines

---

# 50. Component Library Summary

The Document Workflow Platform adopts a reusable component-driven architecture to ensure consistency, scalability, and maintainability across the frontend.

The official UI stack consists of:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Lucide React
- TanStack Table
- React Hook Form
- Zod
- Recharts

All UI development should prioritize:

- Reusability
- Accessibility
- Consistency
- Performance
- Simplicity
- Responsive Design

Developers should always reuse existing components before creating new ones, ensuring that the platform evolves as a cohesive design system rather than a collection of isolated interfaces.

---

# End of Document