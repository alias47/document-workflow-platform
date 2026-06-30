import { randomUUID } from 'node:crypto';

import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import type { Request, Response } from 'express';

interface ValidationErrorBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: { field?: string; message: string }[] | undefined;

    if (exception instanceof HttpException) {
      const body = exception.getResponse() as ValidationErrorBody | string;
      if (typeof body === 'string') {
        message = body;
      } else if (Array.isArray(body.message)) {
        message = 'Validation failed.';
        errors = body.message.map((m) => ({ message: m }));
      } else {
        message = body.message ?? message;
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    const errorCode = this.statusToCode(status);
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();

    res.status(status).json({
      success: false,
      message,
      errorCode,
      ...(errors ? { errors } : {}),
      requestId,
    });
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      413: 'FILE_TOO_LARGE',
      422: 'BUSINESS_RULE_VIOLATION',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] ?? 'INTERNAL_SERVER_ERROR';
  }
}
