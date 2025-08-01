import { type Request, type Response, type NextFunction } from 'express';
import { type ParsedQs } from 'qs';
import { ProductService } from '../services/ProductService.ts';
import {
  type ProductCreateData,
  type ProductUpdateData,
} from '../schemas/products/ProductSchemas.ts';
import {
  type ProductFilterData,
  type ProductQueryOptionsData,
} from '../schemas/query/ProductFilterSchema.ts';
import { type QueryOptions } from '../services/types/base.types.ts';

export class ProductController {
  private productService = new ProductService();

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

  getProductBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const options: QueryOptions = {
        populate: ['categories', 'images'],
      };

      const product = await this.productService.findBySlug(slug, options);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const options: QueryOptions = {
        populate: ['categories', 'images'],
      };

      const product = await this.productService.findById(id, options);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productData: ProductCreateData = req.body;
      const product = await this.productService.create(productData);

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const productData: ProductUpdateData = req.body;

      const product = await this.productService.update(id, productData);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.softDelete(id);

      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  restoreProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.restore(id);

      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  addProductImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { imageIds } = req.body;

      if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(400).json({ error: 'imageIds array is required' });
        return;
      }

      const product = await this.productService.addImages(id, imageIds);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  removeProductImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { imageIds } = req.body;

      if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(400).json({ error: 'imageIds array is required' });
        return;
      }

      const product = await this.productService.removeImages(id, imageIds);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  replaceProductImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { imageIds } = req.body;

      if (!imageIds || !Array.isArray(imageIds)) {
        res.status(400).json({ error: 'imageIds array is required' });
        return;
      }

      const product = await this.productService.replaceImages(id, imageIds);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  private buildFilterFromQuery(query: ParsedQs): ProductFilterData {
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
