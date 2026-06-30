import { Injectable, Logger } from '@nestjs/common';

import type { EmailProvider, SendEmailOptions } from './email-provider.interface';

@Injectable()
export class MockEmailProvider implements EmailProvider {
  private readonly logger = new Logger(MockEmailProvider.name);

  async send(options: SendEmailOptions): Promise<void> {
    this.logger.log(`[MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
  }
}
