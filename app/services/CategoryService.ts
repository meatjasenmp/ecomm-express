import { type FilterQuery } from 'mongoose';
import Category from '../db/models/Category.ts';
import { type CategoryInterface } from '../db/models/Category.ts';
import { BaseService } from './BaseService.ts';
import { type QueryOptions, type PaginatedResult } from './types/base.types.ts';
import { type CategoryFilter } from './types/category.types.ts';
import { NotFoundError, ValidationError, DuplicateError } from '../errors/ErrorTypes.ts';
import { createSlug } from '../helpers/slugify.ts';
import {
  CategoryCreateSchema,
  CategoryUpdateSchema,
  type CategoryCreateData,
  type CategoryUpdateData,
} from '../schemas/categories/CategorySchemas.ts';

export class CategoryService extends BaseService<CategoryInterface> {
  protected model = Category;
  protected resourceName = 'Category';

  protected getBaseFilter(): FilterQuery<CategoryInterface> {
    return { deletedAt: null };
  }

  async findById(id: string, options?: Partial<QueryOptions>): Promise<CategoryInterface> {
    return this.findByIdWithOptions(id, options);
  }

  async findBySlug(slug: string, options?: Partial<QueryOptions>): Promise<CategoryInterface> {
    const query = this.model.findOne({ slug, ...this.getBaseFilter() });

    if (options?.select) query.select(options.select);

    if (options?.populate) {
      this.applyPopulations(query, options.populate);
    }

    const category = await query.exec();

    if (!category) {
      throw new NotFoundError(this.resourceName, `slug: ${slug}`);
    }

    return category;
  }

  async findAll(
    filter: CategoryFilter,
    options: QueryOptions,
  ): Promise<PaginatedResult<CategoryInterface>> {
    const mongoFilter = this.buildCategoryFilter(filter);
    return this.findWithPagination(mongoFilter, options);
  }

  async create(input: CategoryCreateData): Promise<CategoryInterface> {
    const validatedData = await this.validateCreateInput(input);

    const slug = createSlug(validatedData.name);
    await this.checkSlugUniqueness(slug);

    const category = new this.model({
      ...validatedData,
      slug,
      publishedAt: validatedData.isPublished ? new Date() : undefined,
    });

    return category.save();
  }

  async update(id: string, input: CategoryUpdateData): Promise<CategoryInterface> {
    const validatedData = await this.validateUpdateInput(input);

    const category = await this.findById(id);

    if (validatedData.name && validatedData.name !== category.name) {
      const newSlug = createSlug(validatedData.name);
      await this.checkSlugUniqueness(newSlug, id);
      category.slug = newSlug;
    }

    this.updatePublishedAt(validatedData, category);

    Object.assign(category, validatedData);
    return category.save();
  }

  async softDelete(id: string): Promise<CategoryInterface> {
    const category = await this.findById(id);
    category.deletedAt = new Date();
    return category.save();
  }

  async restore(id: string): Promise<CategoryInterface> {
    const category = await this.findByIdRaw(id);
    category.deletedAt = null;
    return category.save();
  }

  private buildCategoryFilter(filter: CategoryFilter): FilterQuery<CategoryInterface> {
    const mongoFilter: FilterQuery<CategoryInterface> = {
      ...this.getBaseFilter(),
    };

    this.applyFilter(filter, mongoFilter, 'status', (value, mf) => {
      mf.status = value;
    });

    this.applyFilter(filter, mongoFilter, 'isPublished', (value, mf) => {
      mf.isPublished = value;
    });

    this.applyFilter(filter, mongoFilter, 'parentId', (value, mf) => {
      mf.parentId = value;
    });

    this.applyFilter(filter, mongoFilter, 'search', (value, mf) => {
      mf.$or = [
        { name: new RegExp(value, 'i') },
        { description: new RegExp(value, 'i') },
      ];
    });

    return mongoFilter;
  }

  private applyFilter<K extends keyof CategoryFilter>(
    filter: CategoryFilter,
    mongoFilter: FilterQuery<CategoryInterface>,
    key: K,
    handler: (
      value: NonNullable<CategoryFilter[K]>,
      filter: FilterQuery<CategoryInterface>,
    ) => void,
  ): void {
    const value = filter[key];
    if (value !== undefined) handler(value, mongoFilter);
  }

  private async validateCreateInput(input: CategoryCreateData): Promise<CategoryCreateData> {
    const result = CategoryCreateSchema.safeParse(input);

    if (!result.success) {
      const errors = result.error.issues[0];
      throw new ValidationError(errors.message, {
        field: errors.path.join('.'),
        issues: result.error.issues,
      });
    }

    return result.data;
  }

  private async validateUpdateInput(input: CategoryUpdateData): Promise<CategoryUpdateData> {
    const result = CategoryUpdateSchema.safeParse(input);

    if (!result.success) {
      const errors = result.error.issues[0];
      throw new ValidationError(errors.message, {
        field: errors.path.join('.'),
        issues: result.error.issues,
      });
    }

    return result.data;
  }

  private async checkSlugUniqueness(slug: string, excludeId?: string): Promise<void> {
    const filter: FilterQuery<CategoryInterface> = { slug };

    if (excludeId) filter._id = { $ne: excludeId };

    const exist = await this.model.findOne(filter);
    if (exist) throw new DuplicateError(this.resourceName, 'slug', slug);
  }

  private updatePublishedAt(
    validatedData: CategoryUpdateData,
    category: CategoryInterface,
  ): void {
    if (validatedData.isPublished === undefined) return;
    const { isPublished } = validatedData;
    const isBeingPublished = isPublished && !category.isPublished;
    const isBeingUnpublished = !validatedData.isPublished;

    if (isBeingPublished) validatedData.publishedAt = new Date();
    if (isBeingUnpublished) validatedData.publishedAt = undefined;
  }
}