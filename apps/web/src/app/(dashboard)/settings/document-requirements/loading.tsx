import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Skeleton className="h-7 w-56 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-36" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
