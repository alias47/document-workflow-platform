import { SkeletonCard, SkeletonStatCard, SkeletonTableRow } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            className="animate-pulse rounded-md bg-[#E2E8F0]"
            style={{ height: '28px', width: '160px' }}
          />
          <div
            className="animate-pulse rounded-md bg-[#E2E8F0]"
            style={{ height: '16px', width: '260px' }}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Main grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 'var(--space-5)',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Recent students table skeleton */}
          <div className="card">
            <div className="card-header">
              <div
                className="animate-pulse rounded-md bg-[#E2E8F0]"
                style={{ height: '20px', width: '140px' }}
              />
            </div>
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonTableRow key={i} cols={6} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documents table skeleton */}
          <div className="card">
            <div className="card-header">
              <div
                className="animate-pulse rounded-md bg-[#E2E8F0]"
                style={{ height: '20px', width: '200px' }}
              />
            </div>
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonTableRow key={i} cols={4} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <SkeletonCard rows={4} />
          <SkeletonCard rows={5} />
        </div>
      </div>
    </div>
  );
}
