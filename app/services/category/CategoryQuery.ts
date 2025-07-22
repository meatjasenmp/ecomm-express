import Category, { type CategoryInterface } from '../../db/models/Categories.ts';
import type { CategoryTreeNode, CategoryQueryOptions, PaginatedResult } from './types.ts';

export class CategoryQuery {
  private buildSortOrder(hasSearch: boolean): Record<string, number | { $meta: string }> {
    if (hasSearch) return { score: { $meta: 'textScore' } };
    return { level: 1, sortOrder: 1, name: 1 };
  }

  async getCategoriesPaginated(options: CategoryQueryOptions = {}): Promise<PaginatedResult<CategoryInterface>> {
    const { page = 1, limit = 50, level, parentId, isActive, search } = options;

    const query: Record<string, unknown> = {};

    if (typeof level === 'number') query.level = level;
    if (parentId) query.parentId = parentId;
    if (typeof isActive === 'boolean') query.isActive = isActive;
    if (search) query.$text = { $search: search };

    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort(this.buildSortOrder(!!search) as never)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
    ]);

    return {
      data: categories as CategoryInterface[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buildCategoryTree(rootLevel: number = 0, includeInactive: boolean = false): Promise<CategoryTreeNode[]> {
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
}
