import mongoose from 'mongoose';
import slugify from 'slugify';
import Category, { type CategoryInterface } from '../db/models/Categories.ts';

type CategoryTreeNode = CategoryInterface & {
  children: CategoryTreeNode[];
};

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

/**
 * Convert a category name to URL-friendly slug using slugify
 */
export function createSlug(name: string): string {
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

/**
 * Generate ancestors array from parent category
 * Uses single database query for efficiency
 */
export async function generateAncestors(parentId: string | null): Promise<string[]> {
  if (!parentId) return [];

  const parent = await Category.findById(parentId, 'path ancestors').lean();
  if (!parent) {
    throw new CategoryNotFoundError(parentId);
  }

  return [...parent.ancestors, parent.path];
}

/**
 * Generate the full path for a category based on its parent
 * Production-ready with validation and error handling
 */
export async function generateCategoryPath(name: string, parentId: string | null): Promise<string> {
  const slug = createSlug(name);

  if (!parentId) return slug;

  const parent = await Category.findById(parentId, 'path level').lean();
  if (!parent) throw new CategoryNotFoundError(parentId);

  return `${parent.path}/${slug}`;
}

/**
 * Update paths of all descendant categories using aggregation
 * Production-ready with batch operations and error handling
 */
export async function updateDescendantPaths(categoryId: string, newPath: string): Promise<number> {
  const category = await Category.findById(categoryId, 'path').lean();
  if (!category) {
    throw new CategoryNotFoundError(categoryId);
  }

  const oldPath = category.path;

  const descendants = await Category.find(
    {
      path: { $regex: `^${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/` },
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

/**
 * Check if a path already exists using indexed query
 * Production-ready with proper validation
 */
export async function pathExists(path: string, excludeCategoryId?: string): Promise<boolean> {
  if (!path) return false;

  const query: Record<string, unknown> = { path };

  if (excludeCategoryId) {
    if (!mongoose.Types.ObjectId.isValid(excludeCategoryId)) {
      throw new CategoryError('Invalid category ID format');
    }
    query._id = { $ne: excludeCategoryId };
  }

  const existing = await Category.findOne(query, '_id').lean();
  return !!existing;
}

/**
 * Get all ancestors of a category using materialized path
 * Single query using the ancestors array - highly efficient
 */
export async function getCategoryAncestors(categoryId: string): Promise<CategoryInterface[]> {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new CategoryError('Invalid category ID format');
  }

  const category = await Category.findById(categoryId, 'ancestors').lean();
  if (!category) throw new CategoryNotFoundError(categoryId);

  if (category.ancestors.length === 0) return [];

  const ancestors = await Category.find({
    path: { $in: category.ancestors },
  })
    .sort({ level: 1 })
    .lean();

  return ancestors as CategoryInterface[];
}

/**
 * Get all descendants of a category using path prefix
 * Single efficient query using indexed path field
 */
export async function getCategoryDescendants(categoryId: string): Promise<CategoryInterface[]> {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new CategoryError('Invalid category ID format');
  }

  const category = await Category.findById(categoryId, 'path').lean();
  if (!category) {
    throw new CategoryNotFoundError(categoryId);
  }

  const descendants = await Category.find({
    path: { $regex: `^${category.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/` },
  })
    .sort({ level: 1, sortOrder: 1 })
    .lean();

  return descendants as CategoryInterface[];
}

/**
 * Build complete category tree using optimized aggregation
 * Production-ready with caching potential and memory efficiency
 */
export async function buildCategoryTree(
  rootLevel: number = 0,
  includeInactive: boolean = false,
): Promise<CategoryTreeNode[]> {
  const matchStage: Record<string, unknown> = { level: rootLevel };
  if (!includeInactive) {
    matchStage.isActive = true;
  }

  const rootCategories = await Category.find(matchStage).sort({ sortOrder: 1, name: 1 }).lean();

  const buildChildren = async (parentId: string, parentPath: string): Promise<CategoryTreeNode[]> => {
    const childQuery: Record<string, unknown> = { parentId, ancestors: parentPath };
    if (!includeInactive) childQuery.isActive = true;

    const children = await Category.find(childQuery).sort({ sortOrder: 1, name: 1 }).lean();

    const childrenWithNested: CategoryTreeNode[] = [];
    for (const child of children) {
      const nestedChild: CategoryTreeNode = {
        ...child,
        children: await buildChildren(child._id.toString(), child.path),
      } as CategoryTreeNode;
      childrenWithNested.push(nestedChild);
    }

    return childrenWithNested;
  };

  const tree: CategoryTreeNode[] = [];
  for (const root of rootCategories) {
    const rootWithChildren: CategoryTreeNode = {
      ...root,
      children: await buildChildren(root._id.toString(), root.path),
    } as CategoryTreeNode;
    tree.push(rootWithChildren);
  }

  return tree;
}

/**
 * Comprehensive category hierarchy validation
 * Production-ready with detailed error reporting
 */
export async function validateCategoryHierarchy(categoryData: {
  name: string;
  parentId: string | null;
  level: number;
  _id?: string;
}): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    if (categoryData.level < 0 || categoryData.level > 2) {
      errors.push('Level must be a number between 0 and 2');
    }

    if (categoryData.level === 0 && categoryData.parentId) {
      errors.push('Root level categories (level 0) cannot have a parent');
    }

    if (categoryData.level > 0 && !categoryData.parentId) {
      errors.push('Categories above level 0 must have a parent');
    }

    if (categoryData.parentId) {
      if (!mongoose.Types.ObjectId.isValid(categoryData.parentId)) {
        errors.push('Invalid parent ID format');
      } else {
        const parent = await Category.findById(categoryData.parentId, 'level path').lean();
        if (!parent) {
          errors.push('Parent category not found');
        } else {
          if (parent.level !== categoryData.level - 1) {
            errors.push(
              `Parent level (${parent.level}) must be exactly one level below child level (${categoryData.level})`,
            );
          }

          const proposedPath = await generateCategoryPath(categoryData.name, categoryData.parentId);
          const pathAlreadyExists = await pathExists(proposedPath, categoryData._id);
          if (pathAlreadyExists) {
            errors.push(`Path "${proposedPath}" already exists`);
          }
        }
      }
    }

    if (categoryData._id && categoryData.parentId) {
      const descendants = await getCategoryDescendants(categoryData._id);
      const descendantIds = descendants.map((d) => d._id?.toString());

      if (descendantIds.includes(categoryData.parentId)) {
        errors.push('Cannot set a descendant category as parent (would create cycle)');
      }
    }
  } catch (error) {
    if (error instanceof CategoryError) {
      errors.push(error.message);
    } else {
      errors.push(`Validation failed: ${(error as Error).message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create category with full hierarchy management
 * Production-ready with transactions and comprehensive error handling
 */
export async function createCategoryWithHierarchy(categoryData: {
  name: string;
  description: string;
  parentId: string | null;
  level: number;
  sortOrder?: number;
}): Promise<CategoryInterface> {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const validation = await validateCategoryHierarchy(categoryData);
      if (!validation.valid) {
        throw new InvalidHierarchyError(validation.errors.join('; '));
      }

      const path = await generateCategoryPath(categoryData.name, categoryData.parentId);
      const ancestors = await generateAncestors(categoryData.parentId);

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

/**
 * Get categories with pagination and filtering
 * Production-ready with efficient querying
 */
export async function getCategoriesPaginated(
  options: {
    page?: number;
    limit?: number;
    level?: number;
    parentId?: string;
    isActive?: boolean;
    search?: string;
  } = {},
): Promise<{
  categories: CategoryInterface[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { page = 1, limit = 50, level, parentId, isActive, search } = options;

  const query: Record<string, unknown> = {};

  if (typeof level === 'number') query.level = level;
  if (parentId) query.parentId = parentId;
  if (typeof isActive === 'boolean') query.isActive = isActive;
  if (search) query.$text = { $search: search };

  const [categories, total] = await Promise.all([
    Category.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { level: 1, sortOrder: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Category.countDocuments(query),
  ]);

  return {
    categories: categories as CategoryInterface[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
