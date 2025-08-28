import { describe, it, expect } from '@jest/globals';
import {
  productSchema,
  PRODUCT_VALIDATION_MESSAGES,
} from '../../../app/schemas/product/product.schema.ts';
import {
  productFactories,
  invalidProducts,
  productBoundaries,
} from '../../factories/product-factory.ts';

describe('productSchema - Price Field Validation', () => {
  it('should accept integer price values', () => {
    const validProduct = productFactories.minimal({
      price: 999, // $9.99 in cents
    });

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(999);
      expect(Number.isInteger(result.data.price)).toBe(true);
    }
  });

  it('should accept large integer price values', () => {
    const validProduct = productBoundaries.maxPrice();

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(validProduct.price);
      expect(Number.isInteger(result.data.price)).toBe(true);
    }
  });

  it('should accept the minimum valid price of 1 cent', () => {
    const validProduct = productBoundaries.minPrice();

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(validProduct.price);
    }
  });

  it('should reject decimal price values', () => {
    const invalidProduct = invalidProducts.decimalPrice();

    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['price']);
      expect(result.error.issues[0].message).toBe(
        PRODUCT_VALIDATION_MESSAGES.PRICE.MUST_BE_INTEGER,
      );
    }
  });

  it('should reject negative price values', () => {
    const invalidProduct = invalidProducts.negativePrice();

    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['price']);
      expect(result.error.issues[0].message).toBe(
        PRODUCT_VALIDATION_MESSAGES.PRICE.MIN_VALUE,
      );
    }
  });

  it('should reject prices that are not at least $0.01', () => {
    const invalidProduct = invalidProducts.minPrice();

    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['price']);
      expect(result.error.issues[0].message).toBe(
        PRODUCT_VALIDATION_MESSAGES.PRICE.MIN_VALUE,
      );
    }
  });
});
