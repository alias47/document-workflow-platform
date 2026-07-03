'use client';

import { SettingsError } from '@/features/settings/components/SettingsError';

export default function SettingsErrorPage({ reset }: { reset: () => void }) {
  return (
    <div style={{ padding: '24px' }}>
      <SettingsError onRetry={reset} />
    </div>
  );
}
