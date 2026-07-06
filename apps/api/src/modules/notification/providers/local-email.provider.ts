import { Injectable, Logger } from '@nestjs/common';

import type { EmailProvider, SendEmailInput } from '../interfaces/email-provider.interface';

/**
 * MVP email provider. Instead of hitting a real SMTP/API transport, it logs the
 * outbound email so local development and the pilot can observe delivery without
 * a paid service. Swapping to SMTP/SES/SendGrid later means registering that
 * provider against the EMAIL_PROVIDER token — nothing else changes.
 *
 * It intentionally never throws: local "delivery" always succeeds. A real
 * provider would throw on transport failure, which the queue turns into a retry.
 */
@Injectable()
export class LocalEmailProvider implements EmailProvider {
  private readonly logger = new Logger(LocalEmailProvider.name);

  async send(input: SendEmailInput): Promise<void> {
    this.logger.log(
      `[LOCAL EMAIL] to=${input.to} subject="${input.subject}" bytes=${input.html.length}`,
    );
  }
}
