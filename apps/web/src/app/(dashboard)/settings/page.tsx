import type { Metadata } from 'next';

import { SettingsPageClient } from '@/features/settings/components/SettingsPageClient';

export const metadata: Metadata = {
  title: 'System Settings',
};

export default function SettingsPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
          System Settings
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B' }}>
          Manage your consultancy profile, branding, portal behaviour, and upload rules.
        </p>
      </div>
      <SettingsPageClient />
    </div>
  );
}
