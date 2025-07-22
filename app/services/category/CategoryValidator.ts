import mongoose from 'mongoose';
import Category from '../../db/models/Categories.ts';

export class CategoryValidator {

  validateLevel(level: number): string[] {
    const errors: string[] = [];

    if (level < 0 || level > 2) {
      errors.push('Level must be a number between 0 and 2');
    }

    return errors;
  }

  validateRootLevelConstraints(level: number, parentId: string | null): string[] {
    const errors: string[] = [];

    if (level === 0 && parentId !== null) {
      errors.push('Root level categories (level 0) cannot have a parent');
    }

    if (level > 0 && parentId === null) {
      errors.push('Categories above level 0 must have a parent');
    }

    return errors;
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
    const errors: string[] = [];

    if (parentLevel !== childLevel - 1) {
      errors.push(`Parent level (${parentLevel}) must be exactly one level below child level (${childLevel})`);
    }

    return errors;
  }
}
