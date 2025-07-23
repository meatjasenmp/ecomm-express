import mongoose from 'mongoose';
import slugify from 'slugify';
import Category, { type CategoryInterface } from '../../db/models/Categories.ts';
import { CategoryError, CategoryNotFoundError } from '../errors/CategoryErrors.ts';

export class CategoryHierarchy {
  private createSlug(name: string): string {
    if (!name || !name.trim()) {
      throw new CategoryError('Generated slug is empty - invalid name provided');
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'";!:@]/g,
    });

    if (!slug) {
      throw new CategoryError('Generated slug is empty - invalid name provided');
    }

    return slug;
  }

  async generateAncestors(parentId: string | null): Promise<string[]> {
    if (!parentId) return [];

    const parent = await Category.findOne({ _id: parentId, deletedAt: null }, 'path ancestors').lean();
    if (!parent) throw new CategoryNotFoundError(parentId);
    return [...parent.ancestors, parent.path];
  }

  async generateCategoryPath(name: string, parentId: string | null): Promise<string> {
    const slug = this.createSlug(name);

    if (!parentId) return slug;

    const parent = await Category.findOne({ _id: parentId, deletedAt: null }, 'path level').lean();
    if (!parent) throw new CategoryNotFoundError(parentId);

    return `${parent.path}/${slug}`;
  }

  async updateDescendantPaths(categoryId: string, newPath: string): Promise<number> {
    const category = await Category.findOne({ _id: categoryId, deletedAt: null }, 'path').lean();
    if (!category) throw new CategoryNotFoundError(categoryId);

    const oldPath = category.path;

    const descendants = await Category.find(
      {
        path: { $regex: `^${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/` },
        deletedAt: null,
      },
      'path _id',
    ).lean();

    if (descendants.length === 0) return 0;

    const bulkOps = descendants.map((descendant) => ({
      updateOne: {
        filter: { _id: descendant._id },
        update: {
          $set: {
            path: descendant.path.replace(oldPath, newPath),
            ancestors: descendant.path
              .split('/')
              .slice(0, -1)
              .map((segment) => (segment.startsWith(oldPath) ? segment.replace(oldPath, newPath) : segment)),
          },
        },
      },
    }));

    const result = await Category.bulkWrite(bulkOps);
    return result.modifiedCount;
  }

  async pathExists(path: string, excludeCategoryId?: string): Promise<boolean> {
    if (!path) return false;

    const query: Record<string, unknown> = { path, deletedAt: null };

    if (excludeCategoryId) {
      if (!mongoose.Types.ObjectId.isValid(excludeCategoryId)) {
        throw new CategoryError('Invalid category ID format');
      }
      query._id = { $ne: excludeCategoryId };
    }

    const existing = await Category.findOne(query, '_id').lean();
    return !!existing;
  }

  async getCategoryAncestors(categoryId: string): Promise<CategoryInterface[]> {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new CategoryError('Invalid category ID format');
    }

    const category = await Category.findOne({ _id: categoryId, deletedAt: null }, 'ancestors').lean();
    if (!category) throw new CategoryNotFoundError(categoryId);

    if (category.ancestors.length === 0) return [];

    const ancestors = await Category.find({
      path: { $in: category.ancestors },
      deletedAt: null,
    })
      .sort({ level: 1 })
      .lean();

    return ancestors as CategoryInterface[];
  }

  async getCategoryDescendants(categoryId: string): Promise<CategoryInterface[]> {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new CategoryError('Invalid category ID format');
    }

    const category = await Category.findOne({ _id: categoryId, deletedAt: null }, 'path').lean();
    if (!category) throw new CategoryNotFoundError(categoryId);

    const descendants = await Category.find({
      // Find all categories whose path starts with this category's path + "/" (i.e., direct and indirect children)
      // The regex escapes special characters in the path to prevent regex injection
      path: { $regex: `^${category.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/` },
      deletedAt: null,
    })
      .sort({ level: 1, sortOrder: 1 })
      .lean();

    return descendants as CategoryInterface[];
  }
}
