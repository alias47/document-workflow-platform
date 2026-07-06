import type { Metadata } from 'next';

import { NotificationPageClient } from '@/features/notifications/components/NotificationPageClient';

export const metadata: Metadata = {
  title: 'Notifications',
};

export default function NotificationsPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
          Notifications
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B' }}>
          Review the history of outgoing notifications and retry failed deliveries.
        </p>
      </div>
      <div className="card">
        <div className="card-body">
          <NotificationPageClient />
        </div>
      </div>
    </div>
  );
}
