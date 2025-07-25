import { type Request, type Response, type NextFunction } from 'express';
import { type ParsedQs } from 'qs';
import { ProductService } from '../services/ProductService.ts';
import { type ProductCreateData, type ProductUpdateData } from '../schemas/products/ProductSchemas.ts';
import { type ProductFilter } from '../services/types/product.types.ts';
import { type QueryOptions } from '../services/types/base.types.ts';

export class ProductController {
  private productService = new ProductService();

  getPublicProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter: ProductFilter = {
        isPublished: true,
        ...this.buildFilterFromQuery(req.query),
      };

      const options: QueryOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: (req.query.sort as string) || '-publishedAt',
        populate: ['categories'],
      };

      const result = await this.productService.findAll(filter, options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const options: QueryOptions = {
        populate: ['categories'],
      };

      const product = await this.productService.findBySlug(slug, options);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter: ProductFilter = this.buildFilterFromQuery(req.query);

      const options: QueryOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: (req.query.sort as string) || '-createdAt',
        populate: ['categories'],
      };

      const result = await this.productService.findAll(filter, options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const options: QueryOptions = {
        populate: ['categories'],
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

  private buildFilterFromQuery(query: ParsedQs): ProductFilter {
    const filter: ProductFilter = {};

    if (typeof query.status === 'string') filter.status = query.status as ProductFilter['status'];
    if (typeof query.productType === 'string') filter.productType = query.productType as ProductFilter['productType'];
    if (typeof query.gender === 'string') filter.gender = query.gender as ProductFilter['gender'];
    if (typeof query.brand === 'string') filter.brand = query.brand;

    const categories = this.parseCategoriesFromQuery(query.categories);
    if (categories) filter.categories = categories;

    if (query.isPublished !== undefined && typeof query.isPublished === 'string') {
      filter.isPublished = query.isPublished === 'true';
    }

    if (typeof query.minPrice === 'string') filter.minPrice = parseFloat(query.minPrice);
    if (typeof query.maxPrice === 'string') filter.maxPrice = parseFloat(query.maxPrice);
    if (typeof query.search === 'string') filter.search = query.search;

    return filter;
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
