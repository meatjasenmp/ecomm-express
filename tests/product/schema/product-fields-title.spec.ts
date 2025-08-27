import { describe, it, expect } from '@jest/globals';
import {
  productSchema,
  PRODUCT_VALIDATION_MESSAGES,
} from '../../../app/schemas/product/product.schema.ts';
import { invalidProducts, productBoundaries } from '../../factories/product-factory.ts';

describe('productSchema - Field Validation', () => {
  describe('title field', () => {
    it('should reject an empty string', () => {
      const result = productSchema.safeParse(invalidProducts.emptyTitle());

      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].message).toEqual(
          PRODUCT_VALIDATION_MESSAGES.TITLE.MIN_LENGTH,
        );
      }
    });

    it('should reject a whitespace-only string', () => {
      const result = productSchema.safeParse(invalidProducts.whiteSpaces());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].message).toBe(
          PRODUCT_VALIDATION_MESSAGES.TITLE.MIN_LENGTH,
        );
      }
    });

    it.each([
      ['letter', 'B'],
      ['number', '7'],
      ['special character', '#'],
    ])('should accept a single %s as title', (description, char) => {
      const validProduct = productBoundaries.minTitle({ title: char });

      const result = productSchema.safeParse(validProduct);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(char);
      }
    });

    it('should accept a 200 character title (maximum length)', () => {
      const validProduct = productBoundaries.maxTitle();

      const result = productSchema.safeParse(validProduct);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toHaveLength(200);
        expect(result.data.title).toBe('A'.repeat(200));
      }
    });

    it('should reject a title longer than 200 characters', () => {
      const result = productSchema.safeParse(invalidProducts.longTitle());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].message).toBe(
          PRODUCT_VALIDATION_MESSAGES.TITLE.MAX_LENGTH,
        );
      }
    });
  });
});
