'use client';

interface Props {
  applicantName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResendInvitationDialog({ applicantName, isPending, onConfirm, onCancel }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resend-inv-title"
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <h2
          id="resend-inv-title"
          style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}
        >
          Resend Portal Invitation
        </h2>
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
          The current invitation for <strong>{applicantName}</strong> will be invalidated and a new
          one issued. The new link expires in 7 days.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Resending…' : 'Resend Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}
