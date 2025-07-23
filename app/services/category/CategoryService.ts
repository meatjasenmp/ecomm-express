import mongoose from 'mongoose';
import Category, { type CategoryInterface } from '../../db/models/Categories.ts';
import { CategoryError, CategoryNotFoundError, InvalidHierarchyError } from '../errors/CategoryErrors.ts';
import { CategoryValidator } from './CategoryValidator.ts';
import { CategoryHierarchy } from './CategoryHierarchy.ts';
import { CategoryQuery } from './CategoryQuery.ts';
import type {
  CategoryCreateData,
  CategoryUpdateData,
  CategoryQueryOptions,
  PaginatedResult,
  CategoryTreeNode,
} from './types.ts';

export class CategoryService {
  private validator = new CategoryValidator();
  private hierarchy = new CategoryHierarchy();
  private query = new CategoryQuery();

  private isHierarchyUpdate(updateData: CategoryUpdateData): boolean {
    return updateData.name !== undefined || updateData.parentId !== undefined || updateData.level !== undefined;
  }

  private needsPathUpdate(updateData: CategoryUpdateData, existingCategory: CategoryInterface): boolean {
    const nameChanged = updateData.name !== undefined;
    const parentChanged = updateData.parentId !== undefined && updateData.parentId !== existingCategory.parentId;

    return nameChanged || parentChanged;
  }

  private needsAncestorUpdate(updateData: CategoryUpdateData, existingCategory: CategoryInterface): boolean {
    return updateData.parentId !== undefined && updateData.parentId !== existingCategory.parentId;
  }

  private buildValidationData(updateData: CategoryUpdateData, existingCategory: CategoryInterface, categoryId: string) {
    return {
      name: updateData.name || existingCategory.name,
      parentId: updateData.parentId ?? existingCategory.parentId,
      level: updateData.level ?? existingCategory.level,
      _id: categoryId,
    };
  }

  private async validatePathUniqueness(name: string, parentId: string, excludeCategoryId?: string): Promise<string[]> {
    const errors: string[] = [];

    const proposedPath = await this.hierarchy.generateCategoryPath(name, parentId);
    const pathExists = await this.hierarchy.pathExists(proposedPath, excludeCategoryId);

    if (pathExists) {
      errors.push(`Path "${proposedPath}" already exists`);
    }

    return errors;
  }

  private async validateNoCyclicDependency(categoryId: string, parentId: string): Promise<string[]> {
    const errors: string[] = [];

    const descendants = await this.hierarchy.getCategoryDescendants(categoryId);
    const descendantIds = descendants.map((d) => d._id?.toString());

    if (descendantIds.includes(parentId)) {
      errors.push('Cannot set a descendant category as parent (would create cycle)');
    }

    return errors;
  }

  async validateCategoryHierarchy(categoryData: {
    name: string;
    parentId: string | null;
    level: number;
    _id?: string;
  }): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const levelErrors = this.validator.validateLevel(categoryData.level);
      errors.push(...levelErrors);
      
      const rootLevelErrors = this.validator.validateRootLevelConstraints(categoryData.level, categoryData.parentId);
      errors.push(...rootLevelErrors);

      if (categoryData.parentId) {
        const parentValidation = await this.validator.validateParentExists(categoryData.parentId);

        if (!parentValidation.valid) {
          errors.push(parentValidation.error!);
        } else {
          const parentLevelErrors = this.validator.validateParentLevel(parentValidation.parent!.level, categoryData.level);
          errors.push(...parentLevelErrors);
          
          const pathErrors = await this.validatePathUniqueness(categoryData.name, categoryData.parentId, categoryData._id);
          errors.push(...pathErrors);
        }
      }

      if (categoryData._id && categoryData.parentId) {
        const cyclicErrors = await this.validateNoCyclicDependency(categoryData._id, categoryData.parentId);
        errors.push(...cyclicErrors);
      }
    } catch (error) {
      if (error instanceof CategoryError) {
        errors.push(error.message);
      } else {
        errors.push(`Validation failed: ${(error as Error).message}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async createCategory(categoryData: CategoryCreateData): Promise<CategoryInterface> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const validation = await this.validateCategoryHierarchy(categoryData);
        if (!validation.valid) {
          throw new InvalidHierarchyError(validation.errors.join('; '));
        }

        const path = await this.hierarchy.generateCategoryPath(categoryData.name, categoryData.parentId);
        const ancestors = await this.hierarchy.generateAncestors(categoryData.parentId);

        const newCategory = new Category({
          name: categoryData.name,
          description: categoryData.description,
          parentId: categoryData.parentId,
          level: categoryData.level,
          path,
          ancestors,
          sortOrder: categoryData.sortOrder || 0,
          isActive: true,
        });

        const savedCategory = await newCategory.save({ session });
        return savedCategory.toObject() as CategoryInterface;
      });
    } catch (error) {
      if (error instanceof CategoryError) throw error;
      throw new CategoryError(`Failed to create category: ${(error as Error).message}`);
    } finally {
      await session.endSession();
    }
  }

  async updateCategory(categoryId: string, updateData: CategoryUpdateData): Promise<CategoryInterface> {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new CategoryError('Invalid category ID format');
    }

    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const existingCategory = await Category.findOne({ _id: categoryId, deletedAt: null }).session(session);
        if (!existingCategory) {
          throw new CategoryNotFoundError(categoryId);
        }

        if (this.isHierarchyUpdate(updateData)) {
          const validationData = this.buildValidationData(updateData, existingCategory, categoryId);
          const validation = await this.validateCategoryHierarchy(validationData);

          if (!validation.valid) {
            throw new InvalidHierarchyError(validation.errors.join('; '));
          }

          if (this.needsPathUpdate(updateData, existingCategory)) {
            const newName = updateData.name || existingCategory.name;
            const newParentId = updateData.parentId ?? existingCategory.parentId;
            const newPath = await this.hierarchy.generateCategoryPath(newName, newParentId);

            if (newPath !== existingCategory.path) {
              await this.hierarchy.updateDescendantPaths(categoryId, newPath);
              updateData = { ...updateData, path: newPath };
            }
          }

          if (this.needsAncestorUpdate(updateData, existingCategory)) {
            const newAncestors = await this.hierarchy.generateAncestors(updateData.parentId!);
            updateData = { ...updateData, ancestors: newAncestors };
          }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
          categoryId,
          { $set: updateData },
          { new: true, session, runValidators: true },
        ).lean();

        if (!updatedCategory) {
          throw new CategoryError('Failed to update category');
        }

        return updatedCategory as CategoryInterface;
      });
    } catch (error) {
      if (error instanceof CategoryError) throw error;
      throw new CategoryError(`Failed to update category: ${(error as Error).message}`);
    } finally {
      await session.endSession();
    }
  }

  async getCategories(options: CategoryQueryOptions = {}): Promise<PaginatedResult<CategoryInterface>> {
    return this.query.getCategoriesPaginated(options);
  }

  async getCategoryTree(rootLevel: number = 0, includeInactive: boolean = false): Promise<CategoryTreeNode[]> {
    return this.query.buildCategoryTree(rootLevel, includeInactive);
  }

  async getCategoryAncestors(categoryId: string): Promise<CategoryInterface[]> {
    return this.hierarchy.getCategoryAncestors(categoryId);
  }

  async getCategoryDescendants(categoryId: string): Promise<CategoryInterface[]> {
    return this.hierarchy.getCategoryDescendants(categoryId);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new CategoryError('Invalid category ID format');
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const category = await Category.findOne({ _id: categoryId, deletedAt: null }).session(session);
        if (!category) {
          throw new CategoryNotFoundError(categoryId);
        }

        const descendants = await this.hierarchy.getCategoryDescendants(categoryId);
        if (descendants.length > 0) {
          throw new CategoryError('Cannot delete category with subcategories. Delete subcategories first.');
        }

        const Product = mongoose.model('Product');
        const productsUsingCategory = await Product.countDocuments({ categories: categoryId });
        if (productsUsingCategory > 0) {
          throw new CategoryError(`Cannot delete category. ${productsUsingCategory} products are using this category.`);
        }

        await Category.updateOne(
          { _id: categoryId },
          { $set: { deletedAt: new Date() } },
        ).session(session);
      });
    } catch (error) {
      if (error instanceof CategoryError) throw error;
      throw new CategoryError(`Failed to delete category: ${(error as Error).message}`);
    } finally {
      await session.endSession();
    }
  }

  async restoreCategory(categoryId: string): Promise<CategoryInterface> {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new CategoryError('Invalid category ID format');
    }

    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const category = await Category.findOne({ _id: categoryId, deletedAt: { $ne: null } }).session(session);
        if (!category) {
          throw new CategoryError('Category not found or not deleted');
        }

        const restoredCategory = await Category.findByIdAndUpdate(
          categoryId,
          { $set: { deletedAt: null } },
          { new: true, session },
        ).lean();

        if (!restoredCategory) {
          throw new CategoryError('Failed to restore category');
        }

        return restoredCategory as CategoryInterface;
      });
    } catch (error) {
      if (error instanceof CategoryError) throw error;
      throw new CategoryError(`Failed to restore category: ${(error as Error).message}`);
    } finally {
      await session.endSession();
    }
  }
}

export default new CategoryService();
