import { type ProductInterface } from '../db/models/Product.ts';
import { BaseProductService } from './BaseProductService.ts';
import { type QueryOptions, type PaginatedResult } from './types/base.types.ts';
import { NotFoundError } from '../errors/ErrorTypes.ts';
import {
  type ProductFilterData,
  type ProductQueryOptionsData,
} from '../schemas/query/ProductFilterSchema.ts';

export class ProductService extends BaseProductService {
  async findAll(
    filter: ProductFilterData,
    options: ProductQueryOptionsData,
  ): Promise<PaginatedResult<ProductInterface>> {
    return super.findAll(filter, options, { deletedAt: null, isPublished: true });
  }

  async findBySlug(slug: string, options?: Partial<QueryOptions>): Promise<ProductInterface> {
    const baseFilter = { deletedAt: null, isPublished: true };
    const query = this.model.findOne({ slug, ...baseFilter });

    if (options?.select) query.select(options.select);

    if (options?.populate) {
      this.applyPopulations(query, options.populate);
    }

    const product = await query.exec();

    if (!product) {
      throw new NotFoundError(this.resourceName, `slug: ${slug}`);
    }

    return product;
  }
}
