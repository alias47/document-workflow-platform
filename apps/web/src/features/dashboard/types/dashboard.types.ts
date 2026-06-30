export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatCardData {
  id: string;
  label: string;
  value: number | string;
  trend?: {
    direction: TrendDirection;
    value: string;
    label: string;
  };
  iconName: string;
  colorScheme: 'blue' | 'green' | 'amber' | 'violet';
}

export type ActivityType =
  | 'applicant_created'
  | 'document_uploaded'
  | 'document_approved'
  | 'document_rejected'
  | 'workflow_updated'
  | 'task_completed'
  | 'comment_added';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: string;
  action: string;
  subject: string;
  timestamp: string;
  iconName: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignee?: string;
}

export type DeadlineStatus = 'overdue' | 'due_soon' | 'upcoming';

export interface DeadlineItem {
  id: string;
  title: string;
  applicantName: string;
  dueDate: string;
  status: DeadlineStatus;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  iconName: string;
}

export interface DashboardMockData {
  stats: StatCardData[];
  activity: ActivityItem[];
  tasks: PendingTask[];
  deadlines: DeadlineItem[];
  notifications: NotificationItem[];
}
