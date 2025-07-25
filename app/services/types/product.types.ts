import { type ProductStatus, type ProductType, type Gender } from '../../schemas/products/ProductSchemas.ts';

export type ProductFilter = {
  status?: ProductStatus;
  productType?: ProductType;
  gender?: Gender;
  brand?: string;
  categories?: string[];
  isPublished?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
};