import { z } from 'zod';
import { objectIdSchema } from './objectId.schema';

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;
