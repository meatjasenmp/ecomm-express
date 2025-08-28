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

  it('should reject a description with more than 5000 characters', () => {
    const invalidProduct = invalidProducts.longDescription();
    const result = productSchema.safeParse(invalidProduct);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['description']);
      expect(result.error.issues[0].message).toBe(
        PRODUCT_VALIDATION_MESSAGES.DESCRIPTION.MAX_LENGTH,
      );
    }
  });

  it('should reject a whitespace-only string', () => {
    const result = productSchema.safeParse(invalidProducts.descriptionWhiteSpaces());
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['description']);
      expect(result.error.issues[0].message).toBe(
        PRODUCT_VALIDATION_MESSAGES.DESCRIPTION.MIN_LENGTH,
      );
    }
  });

  it('should accept a description with at exactly 10 characters', () => {
    const validProduct = productFactories.minimal({
      description: 'A'.repeat(10),
    });

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe(validProduct.description);
      expect(result.data.description).toHaveLength(10);
    }
  });

  it('should accept a description with 5000 characters', () => {
    const validProduct = productFactories.minimal({ description: 'A'.repeat(5000) });

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe(validProduct.description);
      expect(result.data.description).toHaveLength(validProduct.description.length);
    }
  });
});
