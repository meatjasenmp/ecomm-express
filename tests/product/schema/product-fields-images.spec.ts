import { describe, it, expect } from '@jest/globals';
import { productSchema } from '../../../app/schemas/product/product.schema.ts';
import { productFactories } from '../../factories/product-factory.ts';

describe('productSchema - Images Field Validation', () => {
  it('should default to undefined when images not provided', async () => {
    const validProduct = productFactories.minimal();

    const result = productSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.images).toBeUndefined();
    }
  });

  it('should accept valid ObjectId array', async () => {
    const validProduct = productFactories.complete();

    const result = productSchema.safeParse(validProduct);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.images)).toBe(true);
      expect(result.data.images?.length).toBeGreaterThan(0);
      result.data.images?.forEach((imageId) => {
        expect(typeof imageId).toBe('string');
        expect(imageId).toHaveLength(24);
      });
    }
  });

  it('should reject invalid ObjectId in images array', () => {
    const invalidProduct = productFactories.minimal({
      images: ['invalid-id', '507f1f77bcf86cd799439011'],
    });

    const result = productSchema.safeParse(invalidProduct);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('images');
    }
  });
});
