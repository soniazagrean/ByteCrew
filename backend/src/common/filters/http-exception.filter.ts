import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/** Global filter: consistent error payloads + logging of every failure. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttp ? exception.getResponse() : null;
    const message =
      typeof body === 'string'
        ? body
        : ((body as { message?: string | string[] } | null)?.message ?? 'Internal server error');

    const line = `${req.method} ${req.originalUrl} -> ${status}`;
    if (status >= 500) {
      this.logger.error(
        line,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${line} ${JSON.stringify(message)}`);
    }

    const extra = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};

    res.status(status).json({
      ...extra,
      statusCode: status,
      message,
      error: isHttp ? exception.name : 'InternalServerError',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
