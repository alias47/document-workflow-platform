'use client';

import { NotificationError } from '@/features/notifications/components/NotificationError';

export default function NotificationsErrorPage({ reset }: { reset: () => void }) {
  return (
    <div style={{ padding: '24px' }}>
      <NotificationError onRetry={reset} />
    </div>
  );
}
