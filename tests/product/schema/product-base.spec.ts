import { describe, it, expect } from '@jest/globals';
import { productSchema } from '../../../app/schemas/product/product.schema.ts';
import { productFactories } from '../product-factory.ts';

describe('productSchema', () => {
  describe('minimal product', () => {
    it('should accept a product with minimum required fields', () => {
      const minimalProduct = productFactories.minimal();

      const result = productSchema.safeParse(minimalProduct);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBeDefined();
        expect(typeof result.data.title).toBe('string');
        expect(result.data.title.length).toBeGreaterThan(0);

        expect(result.data.description).toBeDefined();
        expect(typeof result.data.description).toBe('string');
        expect(result.data.description.length).toBeGreaterThanOrEqual(10);

        expect(result.data.price).toBeDefined();
        expect(typeof result.data.price).toBe('number');
        expect(Number.isInteger(result.data.price)).toBe(true);
        expect(result.data.price).toBeGreaterThanOrEqual(0);

        expect(result.data.images).toEqual([]);
        expect(result.data.categories).toEqual([]);

        expect(result.data.discountPrice).toBeUndefined();
      }
    });
  });
});
