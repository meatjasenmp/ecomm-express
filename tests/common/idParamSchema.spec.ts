import { describe, it, expect } from '@jest/globals';
import { idParamSchema } from '../../app/schemas/common/request.schemas.ts';

describe('idParamSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid object with id field', () => {
      const validParam = {
        id: '507f1f77bcf86cd799439011',
      };

      const result = idParamSchema.safeParse(validParam);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('507f1f77bcf86cd799439011');
      }
    });

    it('should accept object with extra fields (strips them)', () => {
      const paramWithExtras = {
        id: '507f1f77bcf86cd799439011',
        name: 'Extra field',
        other: 123,
      };

      const result = idParamSchema.safeParse(paramWithExtras);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('507f1f77bcf86cd799439011');
        expect(result.data).toEqual({ id: '507f1f77bcf86cd799439011' });
        expect('name' in result.data).toBe(false);
        expect('other' in result.data).toBe(false);
      }
    });
  });

  describe('invalid inputs', () => {
    it('should reject object with invalid id format', () => {
      const invalidParam = {
        id: 'not-a-valid-objectid',
      };

      const result = idParamSchema.safeParse(invalidParam);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['id']);
      }
    });

    it('should reject object with missing id field', () => {
      const noIdParam = {
        name: 'No id here',
      };

      const result = idParamSchema.safeParse(noIdParam);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['id']);
      }
    });

    it('should reject empty object', () => {
      const result = idParamSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['id']);
      }
    });

    it('should reject null and undefined', () => {
      expect(idParamSchema.safeParse(null).success).toBe(false);
      expect(idParamSchema.safeParse(undefined).success).toBe(false);
    });

    it('should reject non-object types', () => {
      expect(idParamSchema.safeParse('507f1f77bcf86cd799439011').success).toBe(false);
      expect(idParamSchema.safeParse(123).success).toBe(false);
      expect(idParamSchema.safeParse([]).success).toBe(false);
    });
  });
});
