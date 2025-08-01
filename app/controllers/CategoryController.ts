import { type Request, type Response, type NextFunction } from 'express';
import { type ParsedQs } from 'qs';
import { CategoryService } from '../services/CategoryService.ts';
import {
  type CategoryCreateData,
  type CategoryUpdateData,
} from '../schemas/categories/CategorySchemas.ts';
import {
  type CategoryFilterData,
  type CategoryQueryOptionsData,
} from '../schemas/query/CategoryFilterSchema.ts';
import { type QueryOptions } from '../services/types/base.types.ts';

export class CategoryController {
  private categoryService = new CategoryService();

  getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filter: CategoryFilterData = this.buildFilterFromQuery(req.query);

      const options: CategoryQueryOptionsData = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: 'createdAt',
        populate: ['image'],
      };

      const result = await this.categoryService.findAll(filter, options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getCategoryBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const options: QueryOptions = { populate: ['image'] };

      const category = await this.categoryService.findBySlug(slug, options);
      res.json(category);
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const options: QueryOptions = { populate: ['image'] };

      const category = await this.categoryService.findById(id, options);
      res.json(category);
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryData: CategoryCreateData = req.body;
      const category = await this.categoryService.create(categoryData);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const categoryData: CategoryUpdateData = req.body;

      const category = await this.categoryService.update(id, categoryData);
      res.json(category);
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.softDelete(id);

      res.json(category);
    } catch (error) {
      next(error);
    }
  };

  restoreCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.restore(id);

      res.json(category);
    } catch (error) {
      next(error);
    }
  };

  setCategoryImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { imageId } = req.body;

      if (!imageId) {
        res.status(400).json({ error: 'imageId is required' });
        return;
      }

      const category = await this.categoryService.setImage(id, imageId);
      res.json(category);
    } catch (error) {
      next(error);
    }
  };

  removeCategoryImage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.removeImage(id);

      res.json(category);
    } catch (error) {
      next(error);
    }
  };

  private buildFilterFromQuery(query: ParsedQs): CategoryFilterData {
    const filter: CategoryFilterData = {};

    this.setStringField(filter, query, 'status');
    this.setStringField(filter, query, 'parentId');
    this.setStringField(filter, query, 'search');

    if (query.isPublished !== undefined && typeof query.isPublished === 'string') {
      filter.isPublished = query.isPublished === 'true';
    }

    return filter;
  }

  private setStringField<K extends keyof CategoryFilterData>(
    filter: CategoryFilterData,
    query: ParsedQs,
    field: K,
  ): void {
    if (typeof query[field] === 'string')
      filter[field] = query[field] as CategoryFilterData[K];
  }
}
