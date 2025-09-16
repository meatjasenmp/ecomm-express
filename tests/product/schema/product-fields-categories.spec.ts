import { describe, it, expect } from '@jest/globals';
import { productSchema } from '../../../app/schemas/product/product.schema.ts';
import { productFactories } from '../../factories/product-factory.ts';

describe('productSchema - Categories Field Validation', () => {
  it('should default to empty array when categories not provided', () => {
    const validProduct = productFactories.minimal();

    const result = productSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categories).toEqual([]);
      expect(Array.isArray(result.data.categories)).toBe(true);
    }
  });

  it('should accept valid ObjectId array', () => {
    const validProduct = productFactories.complete();

    const result = productSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.categories)).toBe(true);
      expect(result.data.categories.length).toBeGreaterThan(0);
      result.data.categories.forEach((categoryId) => {
        expect(typeof categoryId).toBe('string');
        expect(categoryId).toHaveLength(24);
      });
    }
  });

  it('should reject invalid ObjectId in categories array', () => {
    const invalidProduct = productFactories.minimal({
      categories: ['not-valid', '507f1f77bcf86cd799439011'],
    });

    const result = productSchema.safeParse(invalidProduct);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('categories');
    }
  });
});
