export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  protected constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ResourceError extends BaseError {
  public readonly resourceType: string;

  constructor(resourceType: string, message: string, statusCode = 400) {
    super(message, statusCode);
    this.resourceType = resourceType;
    this.name = `${resourceType}Error`;
  }
}

export class NotFoundError extends ResourceError {
  constructor(resourceType: string, id: string) {
    super(resourceType, `${resourceType} with ID ${id} not found`, 404);
    this.name = `${resourceType}NotFoundError`;
  }
}

export class ValidationError extends ResourceError {
  public readonly field?: string;

  constructor(resourceType: string, message: string, field?: string) {
    super(resourceType, message, 400);
    this.field = field;
    this.name = `${resourceType}ValidationError`;
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}
