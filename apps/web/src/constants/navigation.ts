export interface NavItem {
  label: string;
  href: string;
  iconName: string;
  badge?: string;
  /** Permission required to see this item. Omit for always-visible items. */
  permission?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// Staff / admin navigation with permission metadata.
// The Sidebar filters items dynamically; nothing is hidden by hardcoded logic.
export const ADMIN_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      {
        iconName: 'LayoutDashboard',
        label: 'Dashboard',
        href: '/dashboard',
        permission: 'dashboard.view',
      },
      {
        iconName: 'Users',
        label: 'Applicants',
        href: '/applicants',
        permission: 'applicant.view',
      },
      {
        iconName: 'Search',
        label: 'Search',
        href: '/search',
        permission: 'search.view',
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        iconName: 'BarChart2',
        label: 'Reports',
        href: '/reports',
        permission: 'report.view',
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        iconName: 'UserCog',
        label: 'Staff',
        href: '/staff',
        permission: 'staff.view',
      },
      {
        iconName: 'Bell',
        label: 'Notifications',
        href: '/settings/notifications',
        permission: 'notification.view',
      },
      {
        iconName: 'ClipboardList',
        label: 'Document Requirements',
        href: '/settings/document-requirements',
        permission: 'settings.manage',
      },
      {
        iconName: 'Settings',
        label: 'Settings',
        href: '/settings',
        permission: 'settings.manage',
      },
    ],
  },
];

// Applicant portal navigation — all routes verified to exist.
export const PORTAL_NAV = [
  { label: 'Overview', href: '/applicant' },
  { label: 'Documents', href: '/applicant/documents' },
  { label: 'Profile', href: '/applicant/profile' },
];
