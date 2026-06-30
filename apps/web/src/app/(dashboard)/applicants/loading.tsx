import { Skeleton, SkeletonTableRow } from '@/components/ui/skeleton';

export default function ApplicantsLoading() {
  return (
    <div className="page">
      <div className="page-header">
        <Skeleton className="h-7 w-24" />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton className="h-9 w-24 rounded-[10px]" />
          <Skeleton className="h-9 w-28 rounded-[10px]" />
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: 'var(--space-4)',
          alignItems: 'center',
        }}
      >
        <Skeleton className="h-9 w-64 rounded-[10px]" />
        <Skeleton className="h-9 w-36 rounded-[10px]" />
        <Skeleton className="h-9 w-36 rounded-[10px]" />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {[
                  '',
                  'Student',
                  'Destination',
                  'Stage',
                  'Documents',
                  'Counselor',
                  'Added',
                  'Portal',
                  '',
                ].map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonTableRow key={i} cols={9} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
