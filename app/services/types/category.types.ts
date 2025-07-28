import { type CategoryStatus } from '../../schemas/categories/CategorySchemas.ts';

export type CategoryFilter = {
  status?: CategoryStatus;
  isPublished?: boolean;
  parentId?: string;
  search?: string;
};