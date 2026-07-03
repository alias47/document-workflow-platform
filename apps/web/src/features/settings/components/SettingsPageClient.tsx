'use client';

import { ApplicantPortalSettingsCard } from './ApplicantPortalSettingsCard';
import { BrandingCard } from './BrandingCard';
import { ConsultancyProfileCard } from './ConsultancyProfileCard';
import { DocumentUploadSettingsCard } from './DocumentUploadSettingsCard';
import { SettingsError } from './SettingsError';
import { SettingsSkeleton } from './SettingsSkeleton';
import { useSettings } from '../hooks/use-settings';

export function SettingsPageClient() {
  const { data: settings, isLoading, isError, refetch } = useSettings();

  if (isLoading) return <SettingsSkeleton />;

  if (isError || !settings) return <SettingsError onRetry={() => void refetch()} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <ConsultancyProfileCard settings={settings} />
      <BrandingCard settings={settings} />
      <ApplicantPortalSettingsCard settings={settings} />
      <DocumentUploadSettingsCard settings={settings} />
    </div>
  );
}
