interface Props {
  message?: string;
}

export function ReportEmptyState({ message = 'No data matches the current filters.' }: Props) {
  return (
    <div className="card">
      <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontSize: '14px', color: '#64748B' }}>{message}</p>
      </div>
    </div>
  );
}
