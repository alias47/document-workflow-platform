import { NotificationSkeleton } from '@/features/notifications/components/NotificationSkeleton';

export default function Loading() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            height: '28px',
            width: '200px',
            background: '#F1F5F9',
            borderRadius: '6px',
            marginBottom: '8px',
          }}
        />
        <div
          style={{ height: '18px', width: '320px', background: '#F8FAFC', borderRadius: '4px' }}
        />
      </div>
      <div className="card">
        <div className="card-body">
          <NotificationSkeleton />
        </div>
      </div>
    </div>
  );
}
