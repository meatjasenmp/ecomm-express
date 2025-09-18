import { describe, it, expect } from '@jest/globals';
import { objectIdSchema } from '../../app/schemas/common/objectId.schema.ts';

describe('objectIdSchema', () => {
  describe('valid ObjectId strings', () => {
    it('should accept a standard 24-character hex string', () => {
      const validId = '507f1f77bcf86cd799439011';

      const result = objectIdSchema.safeParse(validId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validId);
      }
    });

    it.each([
      ['lowercase hex', '507f1f77bcf86cd799439011'],
      ['uppercase hex', '507F1F77BCF86CD799439011'],
      ['mixed case hex', '507f1F77bcF86cd799439011'],
    ])('should accept %s ObjectId', (description, id) => {
      const result = objectIdSchema.safeParse(id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(id);
      }
    });
  });

  describe('invalid ObjectId formats', () => {
    it('should reject string with less than 24 characters', () => {
      const shortId = '507f1f77bcf86cd79943901'; // 23 chars

      const result = objectIdSchema.safeParse(shortId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ObjectId');
      }
    });

    it('should reject string with more than 24 characters', () => {
      const longId = '507f1f77bcf86cd7994390111'; // 25 chars

      const result = objectIdSchema.safeParse(longId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ObjectId');
      }
    });

    it('should reject string with non-hex characters', () => {
      const invalidId = '507f1f77bcf86cd79943901g';

      const result = objectIdSchema.safeParse(invalidId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ObjectId');
      }
    });

    it('should reject empty string', () => {
      const result = objectIdSchema.safeParse('');

      expect(result.success).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(objectIdSchema.safeParse(null).success).toBe(false);
      expect(objectIdSchema.safeParse(undefined).success).toBe(false);
    });

    it('should reject non-string types', () => {
      expect(objectIdSchema.safeParse(123456).success).toBe(false);
      expect(objectIdSchema.safeParse({}).success).toBe(false);
      expect(objectIdSchema.safeParse([]).success).toBe(false);
    });
  });
});
