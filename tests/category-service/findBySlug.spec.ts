import { describe, it, expect, beforeEach } from '@jest/globals';
import { CategoryService } from '../../app/services/CategoryService.ts';
import { createCategoryData } from '../factories/category.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidSlug, expectValidMongoId } from '../helpers/assertions.ts';
import { NotFoundError } from '../../app/errors/ErrorTypes.ts';
import { type CategoryInterface } from '../../app/db/models/Category.ts';

describe('CategoryService - findBySlug', () => {
  let categoryService: CategoryService;
  let existingCategory: CategoryInterface;

  beforeEach(async () => {
    await clearCollection('categories');
    categoryService = new CategoryService();
    
    existingCategory = await categoryService.create(
      createCategoryData({ name: 'Test Category Name' }),
    );
  });

  it('should find category by valid slug', async () => {
    const found = await categoryService.findBySlug('test-category-name');

    expect(found.id).toBe(existingCategory.id);
    expect(found.name).toBe('Test Category Name');
    expect(found.slug).toBe('test-category-name');
    expectValidSlug(found.slug);
    expectValidMongoId(found.id);
  });

  it('should find category with select options', async () => {
    const found = await categoryService.findBySlug('test-category-name', {
      select: 'name slug status',
    });

    expect(found.name).toBe('Test Category Name');
    expect(found.slug).toBe('test-category-name');
    expect(found.status).toBe(existingCategory.status);
    expect(found.description).toBeUndefined();
  });

  it('should find category with populate options', async () => {
    const found = await categoryService.findBySlug('test-category-name', {
      populate: [],
    });

    expect(found.id).toBe(existingCategory.id);
    expect(found.slug).toBe('test-category-name');
  });

  it('should throw NotFoundError for non-existent slug', async () => {
    await expect(
      categoryService.findBySlug('non-existent-slug'),
    ).rejects.toThrow(NotFoundError);
  });

  it('should not find soft deleted category by slug', async () => {
    await categoryService.softDelete(existingCategory.id);

    await expect(
      categoryService.findBySlug('test-category-name'),
    ).rejects.toThrow(NotFoundError);
  });
});