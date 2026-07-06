'use client';

import { useState } from 'react';

import { NotificationDetailsDialog } from './NotificationDetailsDialog';
import { NotificationError } from './NotificationError';
import { NotificationFilters, type StatusFilter } from './NotificationFilters';
import { NotificationSkeleton } from './NotificationSkeleton';
import { NotificationTable } from './NotificationTable';
import { RetryNotificationDialog } from './RetryNotificationDialog';
import { useNotifications, useRetryNotification } from '../hooks/use-notifications';

import type { Notification } from '../types';

import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/toast';

const PAGE_SIZE = 25;

export function NotificationPageClient() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [detailsTarget, setDetailsTarget] = useState<Notification | null>(null);
  const [retryTarget, setRetryTarget] = useState<Notification | null>(null);

  const retryMutation = useRetryNotification();

  const { data, isLoading, isError, refetch } = useNotifications({
    page,
    pageSize: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status !== 'all' ? { status } : {}),
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: StatusFilter) {
    setStatus(value);
    setPage(1);
  }

  function handleRetryConfirm() {
    if (!retryTarget) return;
    retryMutation.mutate(retryTarget.id, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Retry queued',
          message: `Notification to ${retryTarget.recipient} was re-queued.`,
        });
        setRetryTarget(null);
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Could not retry notification.';
        toast({ type: 'error', title: 'Retry failed', message: msg });
      },
    });
  }

  if (isLoading) return <NotificationSkeleton />;
  if (isError || !data) return <NotificationError onRetry={() => void refetch()} />;

  const notifications = data.data;
  const meta = data.meta;

  return (
    <>
      <NotificationFilters
        search={search}
        status={status}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {notifications.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '2px dashed #E2E8F0',
            borderRadius: '10px',
            background: '#F8FAFC',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>No notifications</p>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            Notifications appear here as the system sends emails.
          </p>
        </div>
      ) : (
        <>
          <NotificationTable
            notifications={notifications}
            onView={setDetailsTarget}
            onRetry={setRetryTarget}
          />
          {meta.totalPages > 1 && (
            <div style={{ marginTop: '16px' }}>
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                pageSize={meta.pageSize}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <NotificationDetailsDialog
        notification={detailsTarget}
        isOpen={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
      />
      <RetryNotificationDialog
        recipient={retryTarget?.recipient ?? ''}
        isOpen={Boolean(retryTarget)}
        isPending={retryMutation.isPending}
        onConfirm={handleRetryConfirm}
        onCancel={() => setRetryTarget(null)}
      />
    </>
  );
}
