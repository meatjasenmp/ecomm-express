import { describe, it, expect, beforeEach } from '@jest/globals';
import { ProductService } from '../../app/services/ProductService.ts';
import { clearCollection } from '../helpers/database.ts';
import { ValidationError } from '../../app/errors/ErrorTypes.ts';
import {
  type ProductFilterData,
  type ProductQueryOptionsData,
} from '../../app/schemas/query/ProductFilterSchema.ts';

describe('ProductService - Query Parameter Validation', () => {
  let productService: ProductService;

  beforeEach(async () => {
    await clearCollection('products');
    productService = new ProductService();
  });

  it('should throw ValidationError for negative page number', async () => {
    await expect(productService.findAll({}, { page: -1, limit: 10 })).rejects.toThrow(
      ValidationError,
    );
  });

  it('should throw ValidationError for limit exceeding maximum', async () => {
    await expect(productService.findAll({}, { page: 1, limit: 200 })).rejects.toThrow(
      ValidationError,
    );
  });

  it('should throw ValidationError for invalid sort field', async () => {
    const options: ProductQueryOptionsData = {
      page: 1,
      limit: 10,
      sort: 'invalidField' as any,
    };
    await expect(productService.findAll({}, options)).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid status value', async () => {
    const filter = { status: 'invalid' } as unknown as ProductFilterData;
    await expect(productService.findAll(filter, { page: 1, limit: 10 })).rejects.toThrow(
      ValidationError,
    );
  });

  it('should throw ValidationError for negative price values', async () => {
    await expect(
      productService.findAll({ minPrice: -10 }, { page: 1, limit: 10 }),
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError when minPrice exceeds maxPrice', async () => {
    await expect(
      productService.findAll({ minPrice: 100, maxPrice: 50 }, { page: 1, limit: 10 }),
    ).rejects.toThrow(ValidationError);
  });

  it('should accept valid query parameters', async () => {
    const filter: ProductFilterData = {
      status: 'active',
      productType: 'shoes',
      gender: 'mens',
      isPublished: true,
      brand: 'Nike',
      minPrice: 50,
      maxPrice: 200,
      search: 'running',
    };
    const options: ProductQueryOptionsData = {
      page: 1,
      limit: 20,
      sort: 'title',
    };

    const result = await productService.findAll(filter, options);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('pagination');
  });

  it('should accept minimal valid parameters', async () => {
    const result = await productService.findAll({}, { page: 1, limit: 10 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('pagination');
  });
});
