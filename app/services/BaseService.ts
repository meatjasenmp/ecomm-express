import mongoose, { Model, Document, type FilterQuery } from 'mongoose';
import { NotFoundError, DatabaseError } from '../errors/ErrorTypes.ts';
import { type QueryOptions, type PaginatedResult } from './types/base.types.ts';

export abstract class BaseService<T extends Document> {
  protected abstract model: Model<T>;
  protected abstract resourceName: string;

  protected getBaseFilter(): FilterQuery<T> {
    return {};
  }

  protected async findByIdRaw(id: string, options?: Partial<QueryOptions>): Promise<T> {
    if (!this.isValidObjectId(id)) {
      throw new NotFoundError(this.resourceName, id);
    }

    let query = this.model.findById(id);

    if (options?.select) {
      query = query.select(options.select) as typeof query;
    }

    if (options?.populate) {
      query = this.applyPopulations(query, options.populate);
    }

    const document = await query.exec();

    if (!document) {
      throw new NotFoundError(this.resourceName, id);
    }

    return document;
  }

  protected async findByIdWithOptions(
    id: string,
    options?: Partial<QueryOptions>,
  ): Promise<T> {
    if (!this.isValidObjectId(id)) {
      throw new NotFoundError(this.resourceName, id);
    }

    let query = this.model.findOne({ _id: id, ...this.getBaseFilter() });

    if (options?.select) {
      query = query.select(options.select) as typeof query;
    }

    if (options?.populate) {
      query = this.applyPopulations(query, options.populate);
    }

    const document = await query.exec();

    if (!document) {
      throw new NotFoundError(this.resourceName, id);
    }

    return document;
  }

  protected async findWithPagination(
    filter: FilterQuery<T>,
    options: QueryOptions,
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    try {
      let query = this.model.find(filter).skip(skip).limit(limit);

      if (options.sort) {
        query = query.sort(options.sort);
      }

      if (options.select) {
        query = query.select(options.select) as typeof query;
      }

      if (options.populate) {
        query = this.applyPopulations(query, options.populate);
      }

      const [data, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch {
      throw new DatabaseError(`find ${this.resourceName} with pagination`, {
        filter,
        options,
      });
    }
  }

  private isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  applyPopulations<Q>(query: Q, populations: string | string[]): Q {
    const populationList = this.normalizePopulations(populations);

    populationList.forEach((pop) => {
      // @ts-expect-error - Mongoose query typing
      query = query.populate(pop);
    });

    return query;
  }

  private normalizePopulations(populations: string | string[]): string[] {
    if (Array.isArray(populations)) return populations;
    return [populations];
  }
}
