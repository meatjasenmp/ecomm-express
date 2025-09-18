import { describe, it, expect } from '@jest/globals';
import {
  productUpdateSchema,
  PRODUCT_VALIDATION_MESSAGES,
} from '../../../app/schemas/product/product.schema.ts';
import { productFactories } from '../../factories/product-factory.ts';

describe('ProductUpdateSchema', () => {
  describe('partial update validation', () => {
    it('should accept an empty update object', () => {
      const emptyUpdate = {};

      const result = productUpdateSchema.safeParse(emptyUpdate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
        expect(result.data.title).toBeUndefined();
        expect(result.data.description).toBeUndefined();
        expect(result.data.price).toBeUndefined();
        expect(result.data.discountPrice).toBeUndefined();
        expect(result.data.images).toBeUndefined();
        expect(result.data.categories).toBeUndefined();
      }
    });

    describe('single field updates', () => {
      it('should accept title only update', () => {
        const update = {
          title: 'Updated Product Title',
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.title).toBe('Updated Product Title');
          expect(result.data.description).toBeUndefined();
          expect(result.data.price).toBeUndefined();
          expect(result.data.discountPrice).toBeUndefined();
        }
      });

      it('should accept description only update', () => {
        const update = {
          description: 'This is an updated product description that is long enough',
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.description).toBe(
            'This is an updated product description that is long enough',
          );
          expect(result.data.price).toBeUndefined();
          expect(result.data.discountPrice).toBeUndefined();
        }
      });

      it('should accept price only update', () => {
        const update = {
          price: 75000,
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.price).toBe(75000);
          expect(result.data.title).toBeUndefined();
          expect(result.data.description).toBeUndefined();
          expect(result.data.discountPrice).toBeUndefined();
        }
      });

      it('should accept discountPrice only update', () => {
        const update = {
          discountPrice: 1999,
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.discountPrice).toBe(1999);
          expect(result.data.title).toBeUndefined();
          expect(result.data.description).toBeUndefined();
          expect(result.data.price).toBeUndefined();
        }
      });
    });

    describe('multiple field updates', () => {
      it('should accept multiple field updates', () => {
        const update = {
          ...productFactories.complete(),
          title: 'Updated Product Name',
          description: 'Updated description that meets the minimum length requirement',
        };
        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.title).toBe('Updated Product Name');
          expect(result.data.description).toBe(
            'Updated description that meets the minimum length requirement',
          );
          expect(result.data.price).toBe(update.price);
          expect(result.data.discountPrice).toBe(update.discountPrice);
          expect(result.data.images).toEqual(update.images);
          expect(result.data.categories).toEqual(update.categories);
          expect(result.data.discountPrice).toBeLessThan(result.data.price!);
        }
      });
    });

    describe('price/discount validation', () => {
      it('should accept when both prices provided and discount < price', () => {
        const update = {
          price: 5000,
          discountPrice: 3500,
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.price).toBe(5000);
          expect(result.data.discountPrice).toBe(3500);
          expect(result.data.discountPrice).toBeLessThan(result.data.price!);
        }
      });

      it('should reject when both prices provided and discount >= price', () => {
        const update = {
          price: 3000,
          discountPrice: 3000,
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toEqual(['discountPrice']);
          expect(result.error.issues[0].message).toBe(
            PRODUCT_VALIDATION_MESSAGES.DISCOUNT_PRICE.LESS_THAN_PRICE,
          );
        }
      });

      it('should accept when only price provided (no validation)', () => {
        const update = {
          price: 2000,
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.price).toBe(2000);
          expect(result.data.discountPrice).toBeUndefined();
        }
      });

      it('should accept when only discountPrice provided (no validation)', () => {
        const update = {
          discountPrice: 1500,
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.discountPrice).toBe(1500);
          expect(result.data.price).toBeUndefined();
        }
      });
    });

    describe('array field updates', () => {
      it('should accept images array update', () => {
        const update = {
          images: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.images).toEqual([
            '507f1f77bcf86cd799439011',
            '507f1f77bcf86cd799439012',
          ]);
          expect(result.data.categories).toBeUndefined();
        }
      });

      it('should accept empty images array (clear images)', () => {
        const update = {
          images: [],
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.images).toEqual([]);
          expect(result.data.categories).toBeUndefined();
        }
      });

      it('should accept categories array update', () => {
        const update = {
          categories: ['507f1f77bcf86cd799439013'],
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.categories).toEqual(['507f1f77bcf86cd799439013']);
          expect(result.data.images).toBeUndefined();
        }
      });

      it('should reject invalid ObjectId in images array', () => {
        const update = {
          images: ['invalid-object-id'],
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('images');
        }
      });

      it('should reject invalid ObjectId in categories array', () => {
        const update = {
          categories: ['not-valid-id', '507f1f77bcf86cd799439013'],
        };

        const result = productUpdateSchema.safeParse(update);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('categories');
        }
      });
    });
  });
});
