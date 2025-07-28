import { describe, it, expect, beforeEach } from '@jest/globals';
import { CategoryService } from '../../app/services/CategoryService.ts';
import { createMultipleCategoriesData } from '../factories/category.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { type CategoryInterface } from '../../app/db/models/Category.ts';

describe('CategoryService - findAll', () => {
  let categoryService: CategoryService;
  let categories: CategoryInterface[];

  beforeEach(async () => {
    await clearCollection('categories');
    categoryService = new CategoryService();

    const categoriesData = createMultipleCategoriesData(10);
    categories = await Promise.all(categoriesData.map((data) => categoryService.create(data)));
  });

  it('should return all categories with default pagination', async () => {
    const result = await categoryService.findAll({}, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(10);
    expect(result.pagination.total).toBe(10);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(20);
    expect(result.pagination.pages).toBe(1);
  });

  it('should filter by status', async () => {
    const targetStatus = categories[0].status;
    const result = await categoryService.findAll(
      { status: targetStatus },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((c) => c.status === targetStatus)).toBe(true);
  });

  it('should filter by isPublished', async () => {
    const publishedCategories = categories.filter((c) => c.isPublished);
    const result = await categoryService.findAll(
      { isPublished: true },
      { page: 1, limit: 20 },
    );

    expect(result.data).toHaveLength(publishedCategories.length);
    expect(result.data.every((c) => c.isPublished)).toBe(true);
  });

  it('should search in name field', async () => {
    const searchTerm = categories[0].name.split(' ')[0];
    const result = await categoryService.findAll(
      { search: searchTerm },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(
      result.data.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
    ).toBe(true);
  });

  it('should search in description field', async () => {
    const categoryWithDescription = categories.find((c) => c.description);

    const searchTerm = categoryWithDescription!.description!.split(' ')[0];
    const result = await categoryService.findAll(
      { search: searchTerm },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(
      result.data.some(
        (c) => c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    ).toBe(true);
  });

  it('should handle pagination correctly', async () => {
    const page1 = await categoryService.findAll({}, { page: 1, limit: 3 });
    const page2 = await categoryService.findAll({}, { page: 2, limit: 3 });

    expect(page1.data).toHaveLength(3);
    expect(page1.pagination.page).toBe(1);
    expect(page1.pagination.pages).toBe(4);

    expect(page2.data).toHaveLength(3);
    expect(page2.pagination.page).toBe(2);
    expect(page2.pagination.pages).toBe(4);

    const page1Ids = page1.data.map((c) => c.id);
    const page2Ids = page2.data.map((c) => c.id);
    expect(page1Ids.some((id) => page2Ids.includes(id))).toBe(false);
  });

  it('should apply select options', async () => {
    const result = await categoryService.findAll(
      {},
      { page: 1, limit: 10, select: 'name status' },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].name).toBeDefined();
    expect(result.data[0].status).toBeDefined();
    expect(result.data[0].description).toBeUndefined();
  });

  it('should apply sort options', async () => {
    const result = await categoryService.findAll({}, { page: 1, limit: 20, sort: 'name' });

    expect(result.data).toHaveLength(10);

    const names = result.data.map((c) => c.name);
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
  });

  it('should combine multiple filters', async () => {
    const targetCategory = categories.find((c) => c.isPublished);

    const result = await categoryService.findAll(
      {
        status: targetCategory!.status,
        isPublished: true,
      },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(
      result.data.every((c) => c.status === targetCategory!.status && c.isPublished),
    ).toBe(true);
  });

  it('should not return soft deleted categories', async () => {
    await categoryService.softDelete(categories[0].id);

    const result = await categoryService.findAll({}, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(9);
    expect(result.data.every((c) => c.id !== categories[0].id)).toBe(true);
  });
});
