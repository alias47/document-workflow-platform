'use client';

import { RefreshCw } from 'lucide-react';

import { ActivityCard } from './ActivityCard';
import { ActivityEmptyState } from './ActivityEmptyState';
import { ActivitySkeleton } from './ActivitySkeleton';
import { useActivity } from '../hooks/use-activity';

import { Button } from '@/components/ui/button';

interface ApplicantActivityProps {
  applicantId: string;
}

export function ApplicantActivity({ applicantId }: ApplicantActivityProps) {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useActivity(applicantId);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  if (isError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '32px 24px',
          gap: '12px',
        }}
      >
        <p style={{ fontSize: '14px', color: '#64748B' }}>Failed to load activity.</p>
        <Button size="sm" variant="secondary" onClick={() => void refetch()}>
          <RefreshCw size={14} />
          Retry
        </Button>
      </div>
    );
  }

  const activities = data?.pages.flatMap((page) => page.data) ?? [];

  if (activities.length === 0) {
    return <ActivityEmptyState />;
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {hasNextPage && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void fetchNextPage()}
            loading={isFetchingNextPage}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
