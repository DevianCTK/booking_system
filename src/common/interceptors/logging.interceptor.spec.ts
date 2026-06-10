import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let loggerSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getMockContext = (statusCode: number = 200) => ({
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', url: '/api/test' }),
      getResponse: () => ({ statusCode }),
    }),
  } as unknown as ExecutionContext);

  it('should log successful requests', (done) => {
    const next = { handle: () => of('test-data') };
    
    interceptor.intercept(getMockContext(200), next as any).subscribe({
      next: () => {
        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('[GET] /api/test 200 -'));
        done();
      },
    });
  });

  it('should log 4xx errors as warn', (done) => {
    const error = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    const next = { handle: () => throwError(() => error) };
    
    interceptor.intercept(getMockContext(), next as any).subscribe({
      error: (err) => {
        expect(loggerWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[GET] /api/test 400 -'));
        expect(err).toBe(error);
        done();
      },
    });
  });

  it('should log 5xx errors as error with stack trace', (done) => {
    const error = new HttpException('Internal Error', HttpStatus.INTERNAL_SERVER_ERROR);
    const next = { handle: () => throwError(() => error) };
    
    interceptor.intercept(getMockContext(), next as any).subscribe({
      error: (err) => {
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[GET] /api/test 500 -'),
          expect.any(String)
        );
        expect(err).toBe(error);
        done();
      },
    });
  });
});
