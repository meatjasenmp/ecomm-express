import { type FilterQuery } from 'mongoose';
import Product from '../db/models/Product.ts';
import { type ProductInterface } from '../db/models/Product.ts';
import { BaseService } from './BaseService.ts';
import { type QueryOptions, type PaginatedResult } from './types/base.types.ts';
import { NotFoundError, ValidationError, DuplicateError } from '../errors/ErrorTypes.ts';
import { createSlug } from '../helpers/slugify.ts';
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  type ProductCreateData,
  type ProductUpdateData,
} from '../schemas/products/ProductSchemas.ts';
import {
  ProductFilterSchema,
  ProductQueryOptionsSchema,
  type ProductFilterData,
  type ProductQueryOptionsData,
} from '../schemas/query/ProductFilterSchema.ts';
import type { ObjectId } from 'mongodb';

export class ProductService extends BaseService<ProductInterface> {
  protected model = Product;
  protected resourceName = 'Product';

  protected getBaseFilter(): FilterQuery<ProductInterface> {
    return { deletedAt: null };
  }

  async findById(id: string, options?: Partial<QueryOptions>): Promise<ProductInterface> {
    return this.findByIdWithOptions(id, options);
  }

  async findBySlug(slug: string, options?: Partial<QueryOptions>): Promise<ProductInterface> {
    const query = this.model.findOne({ slug, ...this.getBaseFilter() });

    if (options?.select) query.select(options.select);

    if (options?.populate) {
      this.applyPopulations(query, options.populate);
    }

    const product = await query.exec();

    if (!product) {
      throw new NotFoundError(this.resourceName, `slug: ${slug}`);
    }

    return product;
  }

  async findAll(
    filter: ProductFilterData,
    options: ProductQueryOptionsData,
  ): Promise<PaginatedResult<ProductInterface>> {
    const validatedFilter = this.validateProductFilter(filter);
    const validatedOptions = this.validateProductQueryOptions(options);

    const mongoFilter = this.buildProductFilter(validatedFilter);
    return this.findWithPagination(mongoFilter, validatedOptions);
  }

  async create(input: ProductCreateData): Promise<ProductInterface> {
    const validatedData = await this.validateCreateInput(input);

    const slug = createSlug(validatedData.title);
    await this.checkSlugUniqueness(slug);

    const product = new this.model({
      ...validatedData,
      slug,
      publishedAt: validatedData.isPublished ? new Date() : undefined,
    });

    return product.save();
  }

  async update(id: string, input: ProductUpdateData): Promise<ProductInterface> {
    const validatedData = await this.validateUpdateInput(input);

    const product = await this.findById(id);

    if (validatedData.title && validatedData.title !== product.title) {
      const newSlug = createSlug(validatedData.title);
      await this.checkSlugUniqueness(newSlug, id);
      product.slug = newSlug;
    }

    this.updatePublishedAt(validatedData, product);

    Object.assign(product, validatedData);
    return product.save();
  }

  async softDelete(id: string): Promise<ProductInterface> {
    const product = await this.findById(id);
    product.deletedAt = new Date();
    return product.save();
  }

  async restore(id: string): Promise<ProductInterface> {
    const product = await this.findByIdRaw(id);
    product.deletedAt = null;
    return product.save();
  }

  private buildProductFilter(filter: ProductFilterData): FilterQuery<ProductInterface> {
    const mongoFilter: FilterQuery<ProductInterface> = {
      ...this.getBaseFilter(),
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

  private async validateCreateInput(input: ProductCreateData): Promise<ProductCreateData> {
    const result = ProductCreateSchema.safeParse(input);

    if (!result.success) {
      const errors = result.error.issues[0];
      throw new ValidationError(errors.message, {
        field: errors.path.join('.'),
        issues: result.error.issues,
      });
    }

    return result.data;
  }

  private async validateUpdateInput(input: ProductUpdateData): Promise<ProductUpdateData> {
    const result = ProductUpdateSchema.safeParse(input);

    if (!result.success) {
      const firstError = result.error.issues[0];
      throw new ValidationError(firstError.message, {
        field: firstError.path.join('.'),
        issues: result.error.issues,
      });
    }

    return result.data;
  }

  private async checkSlugUniqueness(slug: string, excludeId?: string): Promise<void> {
    const filter: FilterQuery<ProductInterface> = { slug };

    if (excludeId) filter._id = { $ne: excludeId };

    const exist = await this.model.findOne(filter);
    if (exist) throw new DuplicateError(this.resourceName, 'slug', slug);
  }

  private updatePublishedAt(
    validatedData: ProductUpdateData,
    product: ProductInterface,
  ): void {
    if (validatedData.isPublished === undefined) return;
    const { isPublished } = validatedData;
    const isBeingPublished = isPublished && !product.isPublished;
    const isBeingUnpublished = !validatedData.isPublished;

    if (isBeingPublished) validatedData.publishedAt = new Date();
    if (isBeingUnpublished) validatedData.publishedAt = undefined;
  }

  private validateProductFilter(filter: ProductFilterData): ProductFilterData {
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

  private validateProductQueryOptions(
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

  async addImages(id: string, imageIds: string[]): Promise<ProductInterface> {
    const product = await this.findById(id);
    const uniqueImageIds = [
      ...new Set([...product.images.map((id) => id.toString()), ...imageIds]),
    ];
    product.images = uniqueImageIds.map((id) => id as unknown as ObjectId);
    return product.save();
  }

  async removeImages(id: string, imageIds: string[]): Promise<ProductInterface> {
    const product = await this.findById(id);
    product.images = product.images.filter(
      (imageId) => !imageIds.includes(imageId.toString()),
    );
    return product.save();
  }

  async replaceImages(id: string, imageIds: string[]): Promise<ProductInterface> {
    const product = await this.findById(id);
    product.images = imageIds.map((id) => id as unknown as ObjectId);
    return product.save();
  }

  async getImagesForProduct(id: string): Promise<string[]> {
    const product = await this.findById(id, { select: 'images' });
    return product.images.map((id) => id.toString());
  }
}
