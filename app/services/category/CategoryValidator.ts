import mongoose from 'mongoose';
import Category from '../../db/models/Categories.ts';
import { ErrorCollector } from './ErrorCollector.ts';

export class CategoryValidator {
  private errorCollector = new ErrorCollector();

  validateLevel(level: number): string[] {
    this.errorCollector.clear();

    this.errorCollector.addConditional(level < 0 || level > 2, 'Level must be a number between 0 and 2');

    return this.errorCollector.getErrors();
  }

  validateRootLevelConstraints(level: number, parentId: string | null): string[] {
    this.errorCollector.clear();

    this.errorCollector.addConditional(
      level === 0 && parentId !== null,
      'Root level categories (level 0) cannot have a parent',
    );

    this.errorCollector.addConditional(level > 0 && parentId === null, 'Categories above level 0 must have a parent');

    return this.errorCollector.getErrors();
  }

  async validateParentExists(
    parentId: string,
  ): Promise<{ valid: boolean; parent?: { level: number; path: string }; error?: string }> {
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return { valid: false, error: 'Invalid parent ID format' };
    }

    const parent = await Category.findById(parentId, 'level path').lean();
    if (!parent) {
      return { valid: false, error: 'Parent category not found' };
    }

    return { valid: true, parent: { level: parent.level, path: parent.path } };
  }

  validateParentLevel(parentLevel: number, childLevel: number): string[] {
    this.errorCollector.clear();

    this.errorCollector.addConditional(
      parentLevel !== childLevel - 1,
      `Parent level (${parentLevel}) must be exactly one level below child level (${childLevel})`,
    );

    return this.errorCollector.getErrors();
  }
}
