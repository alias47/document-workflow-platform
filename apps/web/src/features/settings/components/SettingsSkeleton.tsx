import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '24px',
          }}
        >
          <Skeleton className="h-6 w-48 mb-4" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
