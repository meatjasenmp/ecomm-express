import { describe, it, expect, beforeEach } from '@jest/globals';
import { CategoryService } from '../../app/services/CategoryService.ts';
import { clearCollection } from '../helpers/database.ts';
import { ValidationError } from '../../app/errors/ErrorTypes.ts';
import { type CategoryFilterData, type CategoryQueryOptionsData } from '../../app/schemas/query/CategoryFilterSchema.ts';

describe('CategoryService - Query Parameter Validation', () => {
  let categoryService: CategoryService;

  beforeEach(async () => {
    await clearCollection('categories');
    categoryService = new CategoryService();
  });

  it('should throw ValidationError for negative page number', async () => {
    await expect(
      categoryService.findAll({}, { page: -1, limit: 10 }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for limit exceeding maximum', async () => {
    await expect(
      categoryService.findAll({}, { page: 1, limit: 200 }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid sort field', async () => {
    const options: CategoryQueryOptionsData = { page: 1, limit: 10, sort: 'invalidField' as any };
    await expect(
      categoryService.findAll({}, options),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid status value', async () => {
    const filter = { status: 'invalid' } as unknown as CategoryFilterData;
    await expect(
      categoryService.findAll(filter, { page: 1, limit: 10 }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid parent ID format', async () => {
    await expect(
      categoryService.findAll({ parentId: 'invalid-id' }, { page: 1, limit: 10 }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for empty search term', async () => {
    await expect(
      categoryService.findAll({ search: '' }, { page: 1, limit: 10 }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for search term too long', async () => {
    const longSearch = 'a'.repeat(101);
    await expect(
      categoryService.findAll({ search: longSearch }, { page: 1, limit: 10 }),
    ).rejects.toThrow(ValidationError);
  });

  it('should accept valid query parameters', async () => {
    const filter: CategoryFilterData = {
      status: 'active',
      isPublished: true,
      parentId: '507f1f77bcf86cd799439011',
      search: 'clothing',
    };
    const options: CategoryQueryOptionsData = {
      page: 1,
      limit: 20,
      sort: 'name',
    };

    const result = await categoryService.findAll(filter, options);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('pagination');
  });

  it('should accept minimal valid parameters', async () => {
    const result = await categoryService.findAll({}, { page: 1, limit: 10 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('pagination');
  });
});