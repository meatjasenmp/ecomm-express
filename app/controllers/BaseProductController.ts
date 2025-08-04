import { type Request, type Response, type NextFunction } from 'express';
import { type ParsedQs } from 'qs';
import { BaseProductService } from '../services/BaseProductService.ts';
import {
  type ProductFilterData,
  type ProductQueryOptionsData,
} from '../schemas/query/ProductFilterSchema.ts';

export abstract class BaseProductController {
  protected abstract productService: BaseProductService;

  getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter: ProductFilterData = this.buildFilterFromQuery(req.query);

      const options: ProductQueryOptionsData = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: 'createdAt',
        populate: ['categories', 'images'],
      };

      const result = await this.productService.findAll(filter, options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  protected buildFilterFromQuery(query: ParsedQs): ProductFilterData {
    const filter: ProductFilterData = {};

    this.setStringField(filter, query, 'status');
    this.setStringField(filter, query, 'productType');
    this.setStringField(filter, query, 'gender');
    this.setStringField(filter, query, 'brand');
    this.setStringField(filter, query, 'search');

    const categories = this.parseCategoriesFromQuery(query.categories);
    if (categories) filter.categories = categories;

    if (query.isPublished !== undefined && typeof query.isPublished === 'string') {
      filter.isPublished = query.isPublished === 'true';
    }

    if (typeof query.minPrice === 'string') filter.minPrice = parseFloat(query.minPrice);
    if (typeof query.maxPrice === 'string') filter.maxPrice = parseFloat(query.maxPrice);

    return filter;
  }

  private setStringField<K extends keyof ProductFilterData>(
    filter: ProductFilterData,
    query: ParsedQs,
    field: K,
  ): void {
    if (typeof query[field] === 'string') filter[field] = query[field] as ProductFilterData[K];
  }

  private parseCategoriesFromQuery(categories: unknown): string[] | undefined {
    if (!categories) return undefined;

    if (Array.isArray(categories)) {
      return categories.filter((cat): cat is string => typeof cat === 'string');
    }

    if (typeof categories === 'string') return [categories];

    return undefined;
  }
}