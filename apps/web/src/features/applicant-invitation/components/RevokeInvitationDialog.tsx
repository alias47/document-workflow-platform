'use client';

interface Props {
  applicantName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RevokeInvitationDialog({ applicantName, isPending, onConfirm, onCancel }: Props) {
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
      aria-labelledby="revoke-inv-title"
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
          id="revoke-inv-title"
          style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}
        >
          Revoke Invitation
        </h2>
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
          The active invitation for <strong>{applicantName}</strong> will be immediately
          invalidated. They will not be able to use the existing link to activate their account.
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
            className="btn btn-ghost btn-sm"
            style={{ color: '#DC2626' }}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Revoking…' : 'Revoke Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}
