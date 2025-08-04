import { type FilterQuery } from 'mongoose';
import { type ProductInterface } from '../db/models/Product.ts';
import { BaseProductService } from './BaseProductService.ts';
import { type QueryOptions } from './types/base.types.ts';
import { NotFoundError } from '../errors/ErrorTypes.ts';

export class ProductService extends BaseProductService {
  protected getBaseFilter(): FilterQuery<ProductInterface> {
    return { deletedAt: null, isPublished: true };
  }

  async findBySlug(slug: string, options?: Partial<QueryOptions>): Promise<ProductInterface> {
    const query = this.model.findOne({ slug, ...this.getBaseFilter() });

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