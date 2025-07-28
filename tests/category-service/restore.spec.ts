import { describe, it, expect, beforeEach } from '@jest/globals';
import { CategoryService } from '../../app/services/CategoryService.ts';
import { createCategoryData } from '../factories/category.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidMongoId } from '../helpers/assertions.ts';
import { NotFoundError } from '../../app/errors/ErrorTypes.ts';
import { type CategoryInterface } from '../../app/db/models/Category.ts';

describe('CategoryService - restore', () => {
  let categoryService: CategoryService;
  let category: CategoryInterface;

  beforeEach(async () => {
    await clearCollection('categories');
    categoryService = new CategoryService();
    category = await categoryService.create(createCategoryData());
    await categoryService.softDelete(category.id);
  });

  it('should restore soft deleted category successfully', async () => {
    const restoredCategory = await categoryService.restore(category.id);

    expect(restoredCategory.id).toBe(category.id);
    expect(restoredCategory.deletedAt).toBeNull();
    expectValidMongoId(restoredCategory.id);
  });

  it('should be findable after restore', async () => {
    await categoryService.restore(category.id);

    const found = await categoryService.findById(category.id);
    expect(found.id).toBe(category.id);
    expect(found.deletedAt).toBeNull();
  });

  it('should be findable by slug after restore', async () => {
    await categoryService.restore(category.id);

    const found = await categoryService.findBySlug(category.slug);
    expect(found.id).toBe(category.id);
    expect(found.deletedAt).toBeNull();
  });

  it('should appear in findAll results after restore', async () => {
    const anotherCategory = await categoryService.create(createCategoryData());

    await categoryService.restore(category.id);

    const result = await categoryService.findAll({}, { page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.data.some((c) => c.id === category.id)).toBe(true);
    expect(result.data.some((c) => c.id === anotherCategory.id)).toBe(true);
  });

  it('should throw NotFoundError for non-existent category', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    await expect(categoryService.restore(fakeId)).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError for invalid ID format', async () => {
    const invalidId = 'invalid-id';

    await expect(categoryService.restore(invalidId)).rejects.toThrow(NotFoundError);
  });

  it('should handle restoring non-deleted category', async () => {
    const activeCategory = await categoryService.create(createCategoryData());

    const restored = await categoryService.restore(activeCategory.id);
    expect(restored.id).toBe(activeCategory.id);
    expect(restored.deletedAt).toBeNull();
  });

  it('should preserve category data when restored', async () => {
    const originalName = category.name;
    const originalStatus = category.status;

    const restoredCategory = await categoryService.restore(category.id);

    expect(restoredCategory.name).toBe(originalName);
    expect(restoredCategory.status).toBe(originalStatus);
    expect(restoredCategory.deletedAt).toBeNull();
  });

  it('should restore category multiple times without error', async () => {
    const firstRestore = await categoryService.restore(category.id);
    expect(firstRestore.deletedAt).toBeNull();

    const secondRestore = await categoryService.restore(category.id);
    expect(secondRestore.deletedAt).toBeNull();
    expect(secondRestore.id).toBe(category.id);
  });
});
