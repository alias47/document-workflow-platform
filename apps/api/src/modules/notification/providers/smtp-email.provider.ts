import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

import type { EmailProvider, SendEmailInput } from '../interfaces/email-provider.interface';

import { EMAIL_CONFIG_KEY, type EmailConfig } from '@/config/email.config';

@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const cfg = this.config.get<EmailConfig>(EMAIL_CONFIG_KEY) as EmailConfig;

    this.from = cfg.from;
    this.transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.useTls,
      ...(cfg.user ? { auth: { user: cfg.user, pass: cfg.password } } : {}),
    });

    this.logger.log(`SMTP provider configured → ${cfg.host}:${cfg.port} from=${cfg.from}`);
  }

  async send(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
    });

    this.logger.log(`[SMTP] sent to=${input.to} subject="${input.subject}"`);
  }
}
