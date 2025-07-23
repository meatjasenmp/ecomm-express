import { CategoryInterface } from '../../db/models/Categories.ts';

export type CategoryTreeNode = CategoryInterface & {
  children: CategoryTreeNode[];
};

export type CategoryUpdateData = {
  name?: string;
  description?: string;
  parentId?: string | null;
  level?: number;
  sortOrder?: number;
  isActive?: boolean;
  path?: string;
  ancestors?: string[];
};

export type CategoryCreateData = {
  name: string;
  description: string;
  parentId: string | null;
  level: number;
  sortOrder?: number;
};

export type CategoryQueryOptions = {
  page?: number;
  limit?: number;
  level?: number;
  parentId?: string;
  isActive?: boolean;
  search?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};