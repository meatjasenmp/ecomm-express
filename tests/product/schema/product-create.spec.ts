import { describe, it, expect } from '@jest/globals';
import {
  productCreateSchema,
  PRODUCT_VALIDATION_MESSAGES,
} from '../../../app/schemas/product/product.schema.ts';
import { productFactories } from '../../factories/product-factory.ts';

describe('ProductCreateSchema', () => {
  describe('valid product creation', () => {
    it('should accept a valid product with all required fields', () => {
      const validProduct = productFactories.minimal();

      const result = productCreateSchema.safeParse(validProduct);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(validProduct.title);
        expect(result.data.description).toBe(validProduct.description);
        expect(result.data.price).toBe(validProduct.price);
        expect(result.data.images).toBeUndefined();
        expect(result.data.categories).toBeUndefined();
        expect(result.data.discountPrice).toBeUndefined();
      }
    });

    it('should accept a product with a valid discount price', () => {
      const validProduct = productFactories.minimal({
        price: 1000,
        discountPrice: 750,
      });

      const result = productCreateSchema.safeParse(validProduct);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(1000);
        expect(result.data.discountPrice).toBe(750);
        expect(result.data.discountPrice).toBeLessThan(result.data.price);
      }
    });
  });

  describe('discount price validation', () => {
    it('should reject when discount price equals regular price', () => {
      const invalidProduct = productFactories.minimal({
        price: 1000,
        discountPrice: 1000,
      });

      const result = productCreateSchema.safeParse(invalidProduct);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['discountPrice']);
        expect(result.error.issues[0].message).toBe(
          PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.LESS_THAN_PRICE,
        );
      }
    });

    it('should reject when discount price is greater than regular price', () => {
      const invalidProduct = productFactories.minimal({
        price: 1000,
        discountPrice: 1500,
      });

      const result = productCreateSchema.safeParse(invalidProduct);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['discountPrice']);
        expect(result.error.issues[0].message).toBe(
          PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.LESS_THAN_PRICE,
        );
      }
    });
  });

  describe('edge cases', () => {
    it('should reject discount price of 0 with price greater than 0', () => {
      const invalidProduct = productFactories.minimal({
        price: 1000,
        discountPrice: 0,
      });

      const result = productCreateSchema.safeParse(invalidProduct);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['discountPrice']);
        expect(result.error.issues[0].message).toBe(
          PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.MIN_VALUE,
        );
      }
    });

    it('should accept discount price that is 1 cent less than regular price', () => {
      const validProduct = productFactories.minimal({
        price: 1000,
        discountPrice: 999,
      });

      const result = productCreateSchema.safeParse(validProduct);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(1000);
        expect(result.data.discountPrice).toBe(999);
        expect(result.data.price - result.data.discountPrice!).toBe(1);
      }
    });
  });
});
