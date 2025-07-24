import { type ErrorContext } from './types.ts';

export abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;
  readonly timestamp: Date;
  readonly context?: ErrorContext;

  protected constructor(message: string, context?: ErrorContext) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.errorCode,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}
