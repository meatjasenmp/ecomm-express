import { describe, it, expect } from '@jest/globals';
import {
  productSchema,
  PRODUCT_VALIDATION_MESSAGES,
} from '../../../app/schemas/product/product.schema.ts';
import { productFactories } from '../../factories/product-factory.ts';

describe('productSchema - Discount Price Field Validation', () => {
  it('should accept undefined discount price (optional field)', () => {
    const validProduct = productFactories.minimal();

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discountPrice).toBeUndefined();
    }
  });

  it('should accept integer discount price values', () => {
    const validProduct = productFactories.minimal({
      price: 1000,
      discountPrice: 750,
    });

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discountPrice).toBe(750);
      expect(Number.isInteger(result.data.discountPrice)).toBe(true);
    }
  });

  it('should reject decimal discount price values', () => {
    const invalidProduct = productFactories.minimal({
      price: 1000,
      discountPrice: 750.5,
    });

    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['discountPrice']);
      expect(result.error.issues[0].message).toBe(
        PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.MUST_BE_INTEGER,
      );
    }
  });

  it('should accept the minimum valid discount price of 1 cent', () => {
    const validProduct = productFactories.minimal({
      price: 1000,
      discountPrice: 1,
    });

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discountPrice).toBe(1);
    }
  });

  it('should reject a discount price of 0', () => {
    const invalidProduct = productFactories.minimal({
      price: 1000,
      discountPrice: 0,
    });

    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['discountPrice']);
      expect(result.error.issues[0].message).toBe(
        PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.MIN_VALUE,
      );
    }
  });

  it('should reject negative discount price values', () => {
    const invalidProduct = productFactories.minimal({
      price: 1000,
      discountPrice: -100,
    });

    const result = productSchema.safeParse(invalidProduct);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['discountPrice']);
      expect(result.error.issues[0].message).toBe(
        PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.MIN_VALUE,
      );
    }
  });
});
