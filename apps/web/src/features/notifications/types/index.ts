export type NotificationStatus = 'queued' | 'processing' | 'sent' | 'failed';

export interface Notification {
  id: string;
  organizationId: string;
  channel: string;
  status: NotificationStatus;
  template: string;
  recipient: string;
  subject: string;
  body: string;
  metadata: Record<string, unknown> | null;
  retryCount: number;
  maxRetries: number;
  errorMessage: string | null;
  processedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  status?: NotificationStatus;
  template?: string;
  search?: string;
}
