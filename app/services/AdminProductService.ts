import { type FilterQuery } from 'mongoose';
import { type ProductInterface } from '../db/models/Product.ts';
import { BaseProductService } from './BaseProductService.ts';
import { type QueryOptions } from './types/base.types.ts';
import { ValidationError, DuplicateError } from '../errors/ErrorTypes.ts';
import { createSlug } from '../helpers/slugify.ts';
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  type ProductCreateData,
  type ProductUpdateData,
} from '../schemas/products/ProductSchemas.ts';
import type { ObjectId } from 'mongodb';

export class AdminProductService extends BaseProductService {
  protected getBaseFilter(): FilterQuery<ProductInterface> {
    return {};
  }

  async findById(id: string, options?: Partial<QueryOptions>): Promise<ProductInterface> {
    return this.findByIdWithOptions(id, options);
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
}
