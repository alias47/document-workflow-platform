'use client';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
        Failed to load document requirements
      </p>
      <p style={{ fontSize: '13px', color: '#64748B' }}>{error.message}</p>
      <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
