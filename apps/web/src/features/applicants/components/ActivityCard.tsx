'use client';

import {
  ArrowRightLeft,
  CheckCircle2,
  FileUp,
  FileX,
  Pencil,
  StickyNote,
  Trash2,
  UserPlus,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import { type Activity } from '@/services/activity.service';

interface ActivityCardProps {
  activity: Activity;
}

interface IconStyle {
  Icon: LucideIcon;
  color: string;
  background: string;
}

const DEFAULT_ICON: IconStyle = {
  Icon: StickyNote,
  color: '#64748B',
  background: '#F1F5F9',
};

// Visual mapping per activity type. Color is never the only signal — the title
// text always describes the event, so this is purely a scannability aid.
const ICON_BY_TYPE: Record<string, IconStyle> = {
  'applicant.created': { Icon: UserPlus, color: '#2563EB', background: '#EFF6FF' },
  'applicant.updated': { Icon: Pencil, color: '#2563EB', background: '#EFF6FF' },
  'document.uploaded': { Icon: FileUp, color: '#0891B2', background: '#ECFEFF' },
  'document.deleted': { Icon: FileX, color: '#DC2626', background: '#FEF2F2' },
  'document.verified': { Icon: CheckCircle2, color: '#16A34A', background: '#F0FDF4' },
  'document.rejected': { Icon: XCircle, color: '#DC2626', background: '#FEF2F2' },
  'note.created': { Icon: StickyNote, color: '#7C3AED', background: '#F5F3FF' },
  'note.updated': { Icon: Pencil, color: '#7C3AED', background: '#F5F3FF' },
  'note.deleted': { Icon: Trash2, color: '#DC2626', background: '#FEF2F2' },
  'workflow.stage_changed': { Icon: ArrowRightLeft, color: '#D97706', background: '#FFFBEB' },
  'system.created': { Icon: UserPlus, color: '#64748B', background: '#F1F5F9' },
};

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { Icon, color, background } = ICON_BY_TYPE[activity.type] ?? DEFAULT_ICON;
  const { date, time } = formatDateTime(activity.createdAt);
  const actorName = activity.actor
    ? `${activity.actor.firstName} ${activity.actor.lastName}`
    : 'System';

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <Icon size={16} style={{ color }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
            {activity.title}
          </span>
          <span style={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
            {date} · {time}
          </span>
        </div>

        {activity.description && (
          <p
            style={{
              fontSize: '13px',
              color: '#475569',
              lineHeight: '1.5',
              margin: '2px 0 0',
              wordBreak: 'break-word',
            }}
          >
            {activity.description}
          </p>
        )}

        <span style={{ fontSize: '12px', color: '#94A3B8' }}>by {actorName}</span>
      </div>
    </div>
  );
}
