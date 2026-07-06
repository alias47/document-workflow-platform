interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ReportError({ message = 'Failed to load report data.', onRetry }: Props) {
  return (
    <div className="card">
      <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontSize: '14px', color: '#DC2626', marginBottom: '12px' }}>{message}</p>
        {onRetry && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
