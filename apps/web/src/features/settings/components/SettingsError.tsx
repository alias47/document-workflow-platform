'use client';

interface SettingsErrorProps {
  onRetry: () => void;
}

export function SettingsError({ onRetry }: SettingsErrorProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '64px 24px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Failed to load settings</p>
      <p style={{ fontSize: '14px', color: '#64748B' }}>
        An error occurred while fetching the system settings.
      </p>
      <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
