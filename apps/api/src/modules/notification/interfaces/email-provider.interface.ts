/** DI token for the active EmailProvider implementation. */
export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

/** A single outbound email. The body is pre-rendered HTML/text from a template. */
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Abstraction over the email delivery backend. Business code never depends on a
 * vendor SDK directly — only on this interface — so the backing transport can
 * swap (local log → SMTP → SES → SendGrid → Mailgun) by rebinding the
 * {@link EMAIL_PROVIDER} token in the module, with no change to NotificationService.
 */
export interface EmailProvider {
  /**
   * Deliver one email. Resolves on success; throws on any delivery failure so
   * the queue can record the error and schedule a retry.
   */
  send(input: SendEmailInput): Promise<void>;
}
