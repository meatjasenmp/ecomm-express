import { ResourceError, NotFoundError, ValidationError } from './BaseErrors';

export class ProductError extends ResourceError {
  constructor(message: string, statusCode = 400) {
    super('Product', message, statusCode);
  }
}

export class ProductNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Product', id);
  }
}

export class ProductValidationError extends ValidationError {
  constructor(message: string, field?: string) {
    super('Product', message, field);
  }
}
