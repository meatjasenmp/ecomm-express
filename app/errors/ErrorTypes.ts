import { BaseError } from './BaseError.ts';
import { type ErrorContext } from './types.ts';

export class ValidationError extends BaseError {
  readonly statusCode = 400;
  readonly errorCode = 'VALIDATION_ERROR';

  constructor(message: string, context?: ErrorContext) {
    super(message, context);
  }
}

export class NotFoundError extends BaseError {
  readonly statusCode = 404;
  readonly errorCode = 'NOT_FOUND';

  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, { resource, identifier });
  }
}

export class DuplicateError extends BaseError {
  readonly statusCode = 409;
  readonly errorCode = 'DUPLICATE_RESOURCE';

  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} '${value}' already exists`, {
      resource,
      field,
      value,
    });
  }
}

export class UnauthorizedError extends BaseError {
  readonly statusCode = 401;
  readonly errorCode = 'UNAUTHORIZED';

  constructor(message: string = 'Unauthorized access') {
    super(message);
  }
}

export class ForbiddenError extends BaseError {
  readonly statusCode = 403;
  readonly errorCode = 'FORBIDDEN';

  constructor(message: string = 'Access forbidden') {
    super(message);
  }
}

export class InternalServerError extends BaseError {
  readonly statusCode = 500;
  readonly errorCode = 'INTERNAL_SERVER_ERROR';

  constructor(
    message: string = 'Internal server error',
    context?: ErrorContext,
  ) {
    super(message, context);
  }
}

export class DatabaseError extends BaseError {
  readonly statusCode = 500;
  readonly errorCode = 'DATABASE_ERROR';

  constructor(operation: string, context?: ErrorContext) {
    super(`Database operation failed: ${operation}`, context);
  }
}
