import { SkeletonCard, SkeletonStatCard, SkeletonTableRow } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <>
      {/* Stat cards — 7 items, wrapping grid */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Main content grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 'var(--space-5)',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card">
            <div className="card-header">
              <div
                className="animate-pulse rounded-md bg-[#E2E8F0]"
                style={{ height: '20px', width: '160px' }}
              />
            </div>
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonTableRow key={i} cols={4} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <SkeletonCard rows={6} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <SkeletonCard rows={3} />
          <SkeletonCard rows={5} />
        </div>
      </div>
    </>
  );
}
