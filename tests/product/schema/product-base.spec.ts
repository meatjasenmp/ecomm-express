import { describe, it, expect } from '@jest/globals';
import { productSchema } from '../../../app/schemas/product/product.schema.ts';
import { productFactories } from '../../factories/product-factory.ts';
import { VALIDATION_CONSTANTS } from '../../constants/test-constants.ts';

describe('productSchema', () => {
  describe('valid inputs', () => {
    it('should accept a product with minimum required fields', () => {
      const minimalProduct = productFactories.minimal();

      const result = productSchema.safeParse(minimalProduct);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBeDefined();
        expect(typeof result.data.title).toBe('string');
        expect(result.data.title.length).toBeGreaterThan(
          VALIDATION_CONSTANTS.MIN_TITLE_LENGTH,
        );

        expect(result.data.description).toBeDefined();
        expect(typeof result.data.description).toBe('string');
        expect(result.data.description.length).toBeGreaterThanOrEqual(
          VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH,
        );

        expect(result.data.price).toBeDefined();
        expect(typeof result.data.price).toBe('number');
        expect(Number.isInteger(result.data.price)).toBe(true);
        expect(result.data.price).toBeGreaterThanOrEqual(VALIDATION_CONSTANTS.MIN_PRICE);

        expect(result.data.images).toEqual([]);
        expect(result.data.categories).toEqual([]);

        expect(result.data.discountPrice).toBeUndefined();
      }
    });

    it('should accept a product with all optional fields', () => {
      const completeProduct = productFactories.complete();

      const result = productSchema.safeParse(completeProduct);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBeDefined();
        expect(typeof result.data.title).toBe('string');
        expect(result.data.title.length).toBeGreaterThan(
          VALIDATION_CONSTANTS.MIN_TITLE_LENGTH,
        );

        expect(result.data.description).toBeDefined();
        expect(typeof result.data.description).toBe('string');
        expect(result.data.description.length).toBeGreaterThanOrEqual(
          VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH,
        );

        expect(result.data.price).toBeDefined();
        expect(typeof result.data.price).toBe('number');
        expect(Number.isInteger(result.data.price)).toBe(true);
        expect(result.data.price).toBeGreaterThan(VALIDATION_CONSTANTS.MIN_PRICE);

        expect(result.data.discountPrice).toBeDefined();
        expect(typeof result.data.discountPrice).toBe('number');
        expect(Number.isInteger(result.data.discountPrice)).toBe(true);
        expect(result.data.discountPrice).toBeGreaterThan(
          VALIDATION_CONSTANTS.MIN_DISCOUNT_PRICE,
        );
        expect(result.data.discountPrice).toBeLessThan(result.data.price);

        expect(result.data.images).toBeDefined();
        expect(Array.isArray(result.data.images)).toBe(true);
        expect(result.data.images.length).toBeGreaterThan(0);

        result.data.images.forEach((imageId) => {
          expect(typeof imageId).toBe('string');
          expect(imageId.length).toBe(VALIDATION_CONSTANTS.OBJECT_ID_LENGTH);
        });

        expect(result.data.categories).toBeDefined();
        expect(Array.isArray(result.data.categories)).toBe(true);
        expect(result.data.categories.length).toBeGreaterThan(0);

        result.data.categories.forEach((categoryId) => {
          expect(typeof categoryId).toBe('string');
          expect(categoryId.length).toBe(VALIDATION_CONSTANTS.OBJECT_ID_LENGTH);
        });
      }
    });
  });
});
