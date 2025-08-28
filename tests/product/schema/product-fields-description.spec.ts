import { describe, it, expect } from '@jest/globals';
import {
  productSchema,
  PRODUCT_VALIDATION_MESSAGES,
} from '../../../app/schemas/product/product.schema.ts';
import { productFactories, invalidProducts } from '../../factories/product-factory.ts';

describe('productSchema - Description Field Validation', () => {
  it('should reject a description with less than 10 characters', () => {
    const invalidProduct = invalidProducts.shortDescription();

    const result = productSchema.safeParse(invalidProduct);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['description']);
      expect(result.error.issues[0].message).toBe(
        PRODUCT_VALIDATION_MESSAGES.DESCRIPTION.MIN_LENGTH,
      );
    }
  });
});
