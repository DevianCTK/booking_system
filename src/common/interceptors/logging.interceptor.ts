import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() => {
          const responseTime = Date.now() - now;
          const response = ctx.getResponse();
          this.logger.log(`[${method}] ${url} ${response.statusCode} - ${responseTime}ms`);
        }),
        catchError((err) => {
          const responseTime = Date.now() - now;
          const status = err instanceof HttpException ? err.getStatus() : 500;
          if (status >= 500) {
            this.logger.error(`[${method}] ${url} ${status} - ${responseTime}ms - Error: ${err.message}`, err.stack);
          } else {
            this.logger.warn(`[${method}] ${url} ${status} - ${responseTime}ms - Error: ${err.message}`);
          }
          throw err;
        }),
      );
  }
}
