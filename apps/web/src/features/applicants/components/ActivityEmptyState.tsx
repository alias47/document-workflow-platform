'use client';

import { Activity } from 'lucide-react';

export function ActivityEmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Activity size={24} style={{ color: '#2563EB' }} />
      </div>
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>No activity yet</p>
      <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', maxWidth: '280px' }}>
        Activity is recorded automatically as this applicant&apos;s documents, notes, and workflow
        change.
      </p>
    </div>
  );
}
