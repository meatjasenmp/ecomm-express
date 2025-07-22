export class CategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryError';
  }
}

export class CategoryNotFoundError extends CategoryError {
  constructor(id: string) {
    super(`Category with ID ${id} not found`);
  }
}

export class InvalidHierarchyError extends CategoryError {
  constructor(message: string) {
    super(message);
  }
}