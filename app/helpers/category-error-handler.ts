import { Response } from 'express';
import { CategoryError, CategoryNotFoundError, InvalidHierarchyError } from './category-utils.ts';

export function handleCategoryError(err: unknown, res: Response): void {
  if (err instanceof InvalidHierarchyError) {
    res.status(400).json({
      message: 'Invalid category hierarchy',
      error: err.message,
    });
    return;
  }
  
  if (err instanceof CategoryNotFoundError) {
    res.status(404).json({
      message: 'Category not found',
      error: err.message,
    });
    return;
  }
  
  if (err instanceof CategoryError) {
    res.status(400).json({
      message: 'Category operation failed',
      error: err.message,
    });
    return;
  }
  
  console.error('Unexpected error in category operation:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: 'An unexpected error occurred',
  });
}