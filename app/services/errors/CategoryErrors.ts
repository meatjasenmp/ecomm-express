import { ResourceError, NotFoundError } from './BaseErrors';

export class CategoryError extends ResourceError {
  constructor(message: string, statusCode = 400) {
    super('Category', message, statusCode);
  }
}

export class CategoryNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Category', id);
  }
}

export class InvalidHierarchyError extends CategoryError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidHierarchyError';
  }
}
