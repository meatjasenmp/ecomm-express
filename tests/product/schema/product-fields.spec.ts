import { describe, it, expect } from '@jest/globals';
import {
  productSchema,
  PRODUCT_VALIDATION_MESSAGES,
} from '../../../app/schemas/product/product.schema.ts';
import { productFactories } from '../../factories/product-factory.ts';

describe('productSchema - Field Validation', () => {
  describe('title field', () => {
    it('should reject an empty string', () => {
      const invalidProduct = {
        ...productFactories.minimal(),
        title: '',
      };

      const result = productSchema.safeParse(invalidProduct);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['title']);
        expect(result.error.issues[0].message).toEqual(
          PRODUCT_VALIDATION_MESSAGES.TITLE.MIN_LENGTH,
        );
      }
    });
  });
});
