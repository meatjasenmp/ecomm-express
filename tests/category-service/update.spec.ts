import { describe, it, expect, beforeEach } from '@jest/globals';
import { CategoryService } from '../../app/services/CategoryService.ts';
import { createCategoryData } from '../factories/category.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidSlug, expectValidMongoId } from '../helpers/assertions.ts';
import {
  NotFoundError,
  ValidationError,
  DuplicateError,
} from '../../app/errors/ErrorTypes.ts';
import { type CategoryInterface } from '../../app/db/models/Category.ts';

describe('CategoryService - Update', () => {
  let categoryService: CategoryService;
  let existingCategory: CategoryInterface;

  beforeEach(async () => {
    await clearCollection('categories');
    categoryService = new CategoryService();
    existingCategory = await categoryService.create(createCategoryData());
  });

  it('should update category with valid data', async () => {
    const updateData = {
      name: 'Updated Category Name',
      description: 'Updated description',
      status: 'active' as const,
    };

    const updatedCategory = await categoryService.update(existingCategory.id, updateData);

    expect(updatedCategory.name).toBe(updateData.name);
    expect(updatedCategory.description).toBe(updateData.description);
    expect(updatedCategory.status).toBe(updateData.status);
    expectValidSlug(updatedCategory.slug);
    expectValidMongoId(updatedCategory.id);
  });

  it('should update slug when name changes', async () => {
    const updateData = { name: 'New Category Name' };

    const updatedCategory = await categoryService.update(existingCategory.id, updateData);

    expect(updatedCategory.slug).toBe('new-category-name');
    expect(updatedCategory.slug).not.toBe(existingCategory.slug);
  });

  it('should not update slug when name stays the same', async () => {
    const updateData = { description: 'New description' };

    const updatedCategory = await categoryService.update(existingCategory.id, updateData);

    expect(updatedCategory.slug).toBe(existingCategory.slug);
    expect(updatedCategory.description).toBe(updateData.description);
  });

  it('should publish an unpublished category', async () => {
    const updateData = { isPublished: true };

    const updatedCategory = await categoryService.update(existingCategory.id, updateData);

    expect(updatedCategory.isPublished).toBe(true);
    expect(updatedCategory.publishedAt).toBeInstanceOf(Date);
    expect(updatedCategory.publishedAt).not.toBeNull();
  });

  it('should unpublish a published category', async () => {
    await categoryService.update(existingCategory.id, { isPublished: true });

    const updateData = { isPublished: false };
    const updatedCategory = await categoryService.update(existingCategory.id, updateData);

    expect(updatedCategory.isPublished).toBe(false);
    expect(updatedCategory.publishedAt).toBeUndefined();
  });

  it('should throw NotFoundError for non-existent category', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const updateData = { name: 'New Name' };

    await expect(categoryService.update(fakeId, updateData)).rejects.toThrow(NotFoundError);
  });

  it('should throw ValidationError for invalid data', async () => {
    const invalidData = { name: '' };
    await expect(categoryService.update(existingCategory.id, invalidData)).rejects.toThrow(
      ValidationError,
    );
  });

  it('should throw DuplicateError when updating to existing slug', async () => {
    await categoryService.create(createCategoryData({ name: 'Another Category' }));
    await expect(
      categoryService.update(existingCategory.id, { name: 'Another Category' }),
    ).rejects.toThrow(DuplicateError);
  });
});
