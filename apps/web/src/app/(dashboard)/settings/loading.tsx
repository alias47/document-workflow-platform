import { SettingsSkeleton } from '@/features/settings/components/SettingsSkeleton';

export default function SettingsLoading() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            height: '28px',
            width: '200px',
            background: '#F1F5F9',
            borderRadius: '6px',
            marginBottom: '8px',
          }}
        />
        <div
          style={{ height: '18px', width: '300px', background: '#F8FAFC', borderRadius: '4px' }}
        />
      </div>
      <SettingsSkeleton />
    </div>
  );
}
