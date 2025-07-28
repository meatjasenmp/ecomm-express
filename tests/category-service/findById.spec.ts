import { describe, it, expect, beforeEach } from '@jest/globals';
import { CategoryService } from '../../app/services/CategoryService.ts';
import { createCategoryData } from '../factories/category.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidSlug, expectValidMongoId } from '../helpers/assertions.ts';
import { NotFoundError } from '../../app/errors/ErrorTypes.ts';
import { type CategoryInterface } from '../../app/db/models/Category.ts';

describe('CategoryService - findById', () => {
  let categoryService: CategoryService;
  let existingCategory: CategoryInterface;

  beforeEach(async () => {
    await clearCollection('categories');
    categoryService = new CategoryService();
    existingCategory = await categoryService.create(createCategoryData());
  });

  it('should find category by valid ID', async () => {
    const found = await categoryService.findById(existingCategory.id);

    expect(found.id).toBe(existingCategory.id);
    expect(found.name).toBe(existingCategory.name);
    expectValidSlug(found.slug);
    expectValidMongoId(found.id);
  });

  it('should find category with select options', async () => {
    const found = await categoryService.findById(existingCategory.id, {
      select: 'name slug status',
    });

    expect(found.name).toBe(existingCategory.name);
    expect(found.slug).toBe(existingCategory.slug);
    expect(found.status).toBe(existingCategory.status);
    expect(found.description).toBeUndefined();
  });

  it('should find category with populate options', async () => {
    const found = await categoryService.findById(existingCategory.id, {
      populate: [],
    });
    expect(found.id).toBe(existingCategory.id);
  });

  it('should throw NotFoundError for non-existent ID', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    await expect(categoryService.findById(fakeId)).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError for invalid ID format', async () => {
    const invalidId = 'invalid-id';
    await expect(categoryService.findById(invalidId)).rejects.toThrow();
  });

  it('should not find soft deleted category', async () => {
    await categoryService.softDelete(existingCategory.id);
    await expect(categoryService.findById(existingCategory.id)).rejects.toThrow(NotFoundError);
  });
});
