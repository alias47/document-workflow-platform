import { AlertCircle, AlertTriangle, CheckCircle, UserPlus, type LucideIcon } from 'lucide-react';

import type {
  NotificationItem,
  NotificationType,
} from '@/features/dashboard/types/dashboard.types';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';

const ICON_MAP: Record<string, LucideIcon> = {
  AlertTriangle,
  CheckCircle,
  UserPlus,
  AlertCircle,
};

const TYPE_STYLES: Record<NotificationType, { icon: string; dot: string }> = {
  info: { icon: 'bg-[#DBEAFE] text-[#2563EB]', dot: 'bg-[#2563EB]' },
  success: { icon: 'bg-[#DCFCE7] text-[#16A34A]', dot: 'bg-[#16A34A]' },
  warning: { icon: 'bg-[#FEF3C7] text-[#D97706]', dot: 'bg-[#D97706]' },
  danger: { icon: 'bg-[#FFE4E6] text-[#DC2626]', dot: 'bg-[#DC2626]' },
};

interface NotificationWidgetProps {
  notifications: NotificationItem[];
  className?: string;
}

export function NotificationWidget({ notifications, className }: NotificationWidgetProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        {unreadCount > 0 && (
          <span className="text-xs font-semibold text-white bg-[#EF4444] rounded-full px-1.5 py-0.5 leading-none">
            {unreadCount} new
          </span>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-0">
          {notifications.map((notif, index) => {
            const Icon = ICON_MAP[notif.iconName];
            const styles = TYPE_STYLES[notif.type];
            return (
              <li
                key={notif.id}
                className={cn(
                  'flex items-start gap-3 py-3',
                  index < notifications.length - 1 && 'border-b border-[#F1F5F9]',
                  !notif.read && 'relative',
                )}
              >
                {!notif.read && (
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full',
                      styles.dot,
                    )}
                    aria-hidden="true"
                  />
                )}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    styles.icon,
                  )}
                >
                  {Icon && <Icon size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm leading-snug',
                      notif.read ? 'text-[#475569]' : 'font-semibold text-[#1E293B]',
                    )}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-snug">{notif.message}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-1">{notif.timestamp}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter>
        <button
          type="button"
          className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors w-full text-center"
        >
          View all notifications
        </button>
      </CardFooter>
    </Card>
  );
}
