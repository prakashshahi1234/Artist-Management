import winston, { Logger as WinstonLogger } from 'winston';
import { TransformableInfo } from 'logform';
import DailyRotateFile from 'winston-daily-rotate-file';
import { inspect } from 'util';
import { Request, Response } from 'express';

const { combine, timestamp, printf, colorize, errors } = winston.format;

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

export interface LogContext {
  [key: string]: any;
  error?: Error;
  req?: Request;
  res?: Response;
}

export interface LoggerOptions {
  level?: LogLevel;
  consoleEnabled?: boolean;
  fileEnabled?: boolean;
  filePath?: string;
  maxFiles?: number;
  maxSize?: string;
}

export class Logger {
  private static instance: Logger;
  private logger: WinstonLogger;
  private options: Required<LoggerOptions>;

  private constructor(options?: LoggerOptions) {
    this.options = {
      level: LogLevel.INFO,
      consoleEnabled: true,
      fileEnabled: process.env.NODE_ENV === 'production',
      filePath: 'logs',
      maxFiles: 30,
      maxSize: '20m',
      ...options
    };

    const customFormat = printf((info: TransformableInfo) => {
      const { timestamp, level, message, ...rest } = info;
      let log = `${timestamp} [${level.toUpperCase()}] ${message}`;


      // Handle request objects
      if (rest.req) {
        const req = rest.req as Request;
        log += `\n  Request: ${req.method} ${req.originalUrl}`;
        log += `\n  Headers: ${JSON.stringify(req.headers)}`;
        log += `\n  Body: ${JSON.stringify(req.body)}`;
        delete rest.req;
      }

      // Handle response objects
      if (rest.res) {
        const res = rest.res as Response;
        log += `\n  Response: ${res.statusCode}`;
        log += `\n  Headers: ${JSON.stringify(res.getHeaders())}`;
        delete rest.res;
      }

      // Stringify remaining context
      if (Object.keys(rest).length > 0) {
        log += `\n${inspect(rest, { depth: 5, colors: true })}`;
      }

      return log;
    });

    const transports: winston.transport[] = [];

    if (this.options.consoleEnabled) {
      transports.push(
        new winston.transports.Console({
          format: combine(
            colorize({ all: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            customFormat
          )
        })
      );
    }

    if (this.options.fileEnabled) {
      transports.push(
        new DailyRotateFile({
          dirname: this.options.filePath,
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: this.options.maxSize,
          maxFiles: this.options.maxFiles,
          format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            customFormat
          )
        }),
        new winston.transports.File({
          filename: `${this.options.filePath}/errors.log`,
          level: 'error',
          format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            customFormat
          )
        })
      );
    }

    this.logger = winston.createLogger({
      level: this.options.level,
      levels: winston.config.npm.levels,
      transports,
      exitOnError: false,
      handleExceptions: true,
      handleRejections: true
    });

    // Add process event handlers
    this.addProcessEventHandlers();
  }

  public static getInstance(options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }

  private addProcessEventHandlers(): void {
    process.on('uncaughtException', (error) => {
      this.error('Uncaught Exception', { error });
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.error('Unhandled Rejection', { reason, promise });
    });

    process.on('warning', (warning) => {
      this.warn('Node Warning', { warning });
    });
  }

  public error(message: string, context?: LogContext): void {
    this.logger.error(message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  public http(message: string, context?: LogContext): void {
    this.logger.http(message, context);
  }

  public verbose(message: string, context?: LogContext): void {
    this.logger.verbose(message, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  public silly(message: string, context?: LogContext): void {
    this.logger.silly(message, context);
  }

  public log(level: LogLevel, message: string, context?: LogContext): void {
    this.logger.log(level, message, context);
  }

  public createRequestLogger() {
    return (req: Request, res: Response, next: () => void) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        const context = {
          req,
          res,
          duration,
          statusCode: res.statusCode
        };

        if (res.statusCode >= 500) {
          this.error(`${req.method} ${req.originalUrl}`, context);
        } else if (res.statusCode >= 400) {
          this.warn(`${req.method} ${req.originalUrl}`, context);
        } else {
          this.http(`${req.method} ${req.originalUrl}`, context);
        }
      });

      next();
    };
  }

  public shutdown(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.on('finish', () => {
        this.logger.close();
        Logger.instance = null as any;
        resolve();
      });
      this.logger.end();
    });
  }
}

// Default export with sensible defaults
export default Logger.getInstance({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  fileEnabled: process.env.NODE_ENV === 'production',
  filePath: process.env.LOG_DIR || 'logs'
});