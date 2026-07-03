export interface NavItem {
  label: string;
  href: string;
  iconName: string;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// Staff / admin navigation
export const ADMIN_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { iconName: 'LayoutDashboard', label: 'Dashboard', href: '/dashboard' },
      { iconName: 'Users', label: 'Applicants', href: '/applicants', badge: '12' },
      { iconName: 'FileText', label: 'Documents', href: '/documents' },
    ],
  },
  {
    label: 'Management',
    items: [
      { iconName: 'UserCog', label: 'Staff', href: '/staff' },
      { iconName: 'Activity', label: 'Timeline', href: '/timeline' },
      { iconName: 'Bell', label: 'Notifications', href: '/notifications', badge: '3' },
      { iconName: 'Settings', label: 'Settings', href: '/settings' },
      {
        iconName: 'ClipboardList',
        label: 'Document Requirements',
        href: '/settings/document-requirements',
      },
    ],
  },
];

// Applicant portal navigation
export const PORTAL_NAV: NavSection[] = [
  {
    label: 'My Application',
    items: [
      { iconName: 'LayoutDashboard', label: 'Overview', href: '/portal/dashboard' },
      { iconName: 'Upload', label: 'Documents', href: '/portal/documents' },
      { iconName: 'Clock', label: 'Timeline', href: '/portal/timeline' },
    ],
  },
];
