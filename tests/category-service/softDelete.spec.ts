import { describe, it, expect, beforeEach } from '@jest/globals';
import { CategoryService } from '../../app/services/CategoryService.ts';
import { createCategoryData } from '../factories/category.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidMongoId } from '../helpers/assertions.ts';
import { NotFoundError } from '../../app/errors/ErrorTypes.ts';
import { type CategoryInterface } from '../../app/db/models/Category.ts';

describe('CategoryService - softDelete', () => {
  let categoryService: CategoryService;
  let category: CategoryInterface;

  beforeEach(async () => {
    await clearCollection('categories');
    categoryService = new CategoryService();
    category = await categoryService.create(createCategoryData());
  });

  it('should soft delete category successfully', async () => {
    const deletedCategory = await categoryService.softDelete(category.id);

    expect(deletedCategory.id).toBe(category.id);
    expect(deletedCategory.deletedAt).toBeInstanceOf(Date);
    expect(deletedCategory.deletedAt).not.toBeNull();
    expectValidMongoId(deletedCategory.id);
  });

  it('should not be findable after soft delete', async () => {
    await categoryService.softDelete(category.id);
    await expect(categoryService.findById(category.id)).rejects.toThrow(NotFoundError);
  });

  it('should not be findable by slug after soft delete', async () => {
    await categoryService.softDelete(category.id);
    await expect(categoryService.findBySlug(category.slug)).rejects.toThrow(NotFoundError);
  });

  it('should not appear in findAll results after soft delete', async () => {
    const anotherCategory = await categoryService.create(createCategoryData());

    await categoryService.softDelete(category.id);

    const result = await categoryService.findAll({}, { page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(anotherCategory.id);
    expect(result.data.every((c) => c.id !== category.id)).toBe(true);
  });

  it('should throw NotFoundError for non-existent category', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    await expect(categoryService.softDelete(fakeId)).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError for invalid ID format', async () => {
    const invalidId = 'invalid-id';
    await expect(categoryService.softDelete(invalidId)).rejects.toThrow(NotFoundError);
  });

  it('should handle soft deleting already soft deleted category', async () => {
    await categoryService.softDelete(category.id);
    await expect(categoryService.softDelete(category.id)).rejects.toThrow(NotFoundError);
  });

  it('should preserve category data when soft deleted', async () => {
    const originalName = category.name;
    const originalStatus = category.status;

    const deletedCategory = await categoryService.softDelete(category.id);

    expect(deletedCategory.name).toBe(originalName);
    expect(deletedCategory.status).toBe(originalStatus);
  });
});
