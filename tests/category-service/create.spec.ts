import { describe, it, expect, beforeEach } from '@jest/globals';
import { CategoryService } from '../../app/services/CategoryService.ts';
import {
  createCategoryData,
  createPublishedCategoryData,
} from '../factories/category.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidSlug, expectValidMongoId } from '../helpers/assertions.ts';
import { ValidationError, DuplicateError } from '../../app/errors/ErrorTypes.ts';
import { type CategoryCreateData } from '../../app/schemas/categories/CategorySchemas.ts';

describe('CategoryService - Create', () => {
  let categoryService: CategoryService;

  beforeEach(async () => {
    await clearCollection('categories');
    categoryService = new CategoryService();
  });

  it('should create a category with valid data', async () => {
    const categoryData = createCategoryData();
    const category = await categoryService.create(categoryData);

    expect(category.name).toBe(categoryData.name);
    expect(category.description).toBe(categoryData.description);
    expect(category.status).toBe(categoryData.status);
    expect(category.isPublished).toBe(false);
    expect(category.publishedAt).toBeUndefined();
    expectValidSlug(category.slug);
    expectValidMongoId(category.id);
    expect(category.deletedAt).toBeNull();
  });

  it('should create a published category with publishedAt date', async () => {
    const categoryData = createPublishedCategoryData();
    const category = await categoryService.create(categoryData);

    expect(category.isPublished).toBe(true);
    expect(category.publishedAt).toBeInstanceOf(Date);
    expect(category.publishedAt).not.toBeNull();
  });

  it('should generate unique slug from name', async () => {
    const categoryData = createCategoryData({ name: 'Test Category Name' });
    const category = await categoryService.create(categoryData);

    expect(category.slug).toBe('test-category-name');
    expectValidSlug(category.slug);
  });

  it('should throw ValidationError for invalid data', async () => {
    const invalidData = { name: '' } as CategoryCreateData;
    await expect(categoryService.create(invalidData)).rejects.toThrow(ValidationError);
  });

  it('should throw DuplicateError for duplicate slug', async () => {
    const categoryData = createCategoryData({ name: 'Duplicate Name' });
    await categoryService.create(categoryData);

    await expect(
      categoryService.create(createCategoryData({ name: 'Duplicate Name' })),
    ).rejects.toThrow(DuplicateError);
  });
});
