import { BaseError } from './BaseError.ts';
import { InternalServerError } from './ErrorTypes.ts';

export class ErrorHandler {
  static handleError(error: unknown): BaseError {
    if (error instanceof BaseError) return error;

    if (error instanceof Error) {
      return new InternalServerError(error.message, {
        originalError: error.name,
        stack: error.stack,
      });
    }

    return new InternalServerError('An unknown error occurred', {
      originalError: String(error),
    });
  }

  static formatErrorResponse(error: BaseError) {
    return {
      success: false,
      error: error.toJSON(),
    };
  }

  static isOperationalError(error: unknown): boolean {
    return error instanceof BaseError;
  }
}
