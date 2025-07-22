import { z } from 'zod';

export const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format');

export const IdParamsSchema = z.object({
  id: ObjectIdSchema,
});

export type IdParams = z.infer<typeof IdParamsSchema>;