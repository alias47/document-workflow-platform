'use client';

interface Props {
  requirementName: string;
  isOpen: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteRequirementDialog({
  requirementName,
  isOpen,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-req-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#DC2626',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div>
            <h2
              id="delete-req-title"
              style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}
            >
              Archive Requirement
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
              Are you sure you want to archive <strong>&quot;{requirementName}&quot;</strong>? This
              can only be done if no applicants currently have this requirement assigned.
            </p>
          </div>
        </div>
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
            className="btn btn-sm"
            onClick={onConfirm}
            disabled={isPending}
            style={{
              background: '#DC2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {isPending ? 'Archiving…' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
}
