import { type FilterQuery } from 'mongoose';
import Product from '../db/models/Product.ts';
import { type ProductInterface } from '../db/models/Product.ts';
import { BaseService } from './BaseService.ts';
import { type PaginatedResult } from './types/base.types.ts';
import { ValidationError } from '../errors/ErrorTypes.ts';
import {
  ProductFilterSchema,
  ProductQueryOptionsSchema,
  type ProductFilterData,
  type ProductQueryOptionsData,
} from '../schemas/query/ProductFilterSchema.ts';

export abstract class BaseProductService extends BaseService<ProductInterface> {
  protected model = Product;
  protected resourceName = 'Product';

  async findAll(
    filter: ProductFilterData,
    options: ProductQueryOptionsData,
    baseFilter: FilterQuery<ProductInterface> = {}
  ): Promise<PaginatedResult<ProductInterface>> {
    const validatedFilter = this.validateProductFilter(filter);
    const validatedOptions = this.validateProductQueryOptions(options);

    const mongoFilter = this.buildProductFilter(validatedFilter, baseFilter);
    return this.findWithPagination(mongoFilter, validatedOptions);
  }

  buildProductFilter(
    filter: ProductFilterData,
    baseFilter: FilterQuery<ProductInterface> = {}
  ): FilterQuery<ProductInterface> {
    const mongoFilter: FilterQuery<ProductInterface> = {
      ...baseFilter,
    };

    this.applyFilter(filter, mongoFilter, 'status', (value, mf) => {
      mf.status = value;
    });
    this.applyFilter(filter, mongoFilter, 'productType', (value, mf) => {
      mf.productType = value;
    });
    this.applyFilter(filter, mongoFilter, 'gender', (value, mf) => {
      mf.gender = value;
    });
    this.applyFilter(filter, mongoFilter, 'isPublished', (value, mf) => {
      mf.isPublished = value;
    });

    this.applyFilter(filter, mongoFilter, 'brand', (value, mf) => {
      mf.brand = new RegExp(value, 'i');
    });

    this.applyFilter(filter, mongoFilter, 'categories', (value, mf) => {
      if (value.length) mf.categories = { $in: value };
    });

    this.applyFilter(filter, mongoFilter, 'search', (value, mf) => {
      mf.$or = [
        { title: new RegExp(value, 'i') },
        { description: new RegExp(value, 'i') },
        { tags: new RegExp(value, 'i') },
        { searchKeywords: new RegExp(value, 'i') },
      ];
    });

    const priceFilter = this.buildPriceFilter(filter.minPrice, filter.maxPrice);
    if (priceFilter) mongoFilter['variants.price'] = priceFilter;

    return mongoFilter;
  }

  private applyFilter<K extends keyof ProductFilterData>(
    filter: ProductFilterData,
    mongoFilter: FilterQuery<ProductInterface>,
    key: K,
    handler: (
      value: NonNullable<ProductFilterData[K]>,
      filter: FilterQuery<ProductInterface>,
    ) => void,
  ): void {
    const value = filter[key];
    if (value !== undefined) handler(value, mongoFilter);
  }

  private buildPriceFilter(
    minPrice?: number,
    maxPrice?: number,
  ): Record<string, number> | null {
    if (minPrice === undefined && maxPrice === undefined) return null;

    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined) priceFilter.$gte = minPrice;
    if (maxPrice !== undefined) priceFilter.$lte = maxPrice;

    return priceFilter;
  }

  validateProductFilter(filter: ProductFilterData): ProductFilterData {
    const result = ProductFilterSchema.safeParse(filter);

    if (!result.success) {
      const errors = result.error.issues[0];
      throw new ValidationError(errors.message, {
        field: errors.path.join('.'),
        issues: result.error.issues,
      });
    }

    return result.data;
  }

  validateProductQueryOptions(
    options: ProductQueryOptionsData,
  ): ProductQueryOptionsData {
    const result = ProductQueryOptionsSchema.safeParse(options);

    if (!result.success) {
      const errors = result.error.issues[0];
      throw new ValidationError(errors.message, {
        field: errors.path.join('.'),
        issues: result.error.issues,
      });
    }

    return result.data;
  }
}
