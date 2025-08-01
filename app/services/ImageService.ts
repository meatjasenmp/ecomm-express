import { type FilterQuery } from 'mongoose';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import Image from '../db/models/Image.ts';
import { type ImageInterface } from '../db/models/Image.ts';
import { BaseService } from './BaseService.ts';
import { type QueryOptions, type PaginatedResult } from './types/base.types.ts';
import { ValidationError, DatabaseError } from '../errors/ErrorTypes.ts';
import { s3Client, S3_CONFIG } from '../config/aws.ts';
import {
  ImageCreateSchema,
  ImageUpdateSchema,
  type ImageCreateData,
  type ImageUpdateData,
} from '../schemas/images/ImageSchemas.ts';

export interface ImageFilter {
  mimeType?: string;
  minSize?: number;
  maxSize?: number;
  search?: string;
}

export class ImageService extends BaseService<ImageInterface> {
  protected model = Image;
  protected resourceName = 'Image';

  protected getBaseFilter(): FilterQuery<ImageInterface> {
    return { deletedAt: null };
  }

  async findById(id: string, options?: Partial<QueryOptions>): Promise<ImageInterface> {
    return this.findByIdWithOptions(id, options);
  }

  async findAll(
    filter: ImageFilter = {},
    options: QueryOptions = { page: 1, limit: 20 },
  ): Promise<PaginatedResult<ImageInterface>> {
    const mongoFilter = this.buildImageFilter(filter);
    return this.findWithPagination(mongoFilter, options);
  }

  async create(input: ImageCreateData): Promise<ImageInterface> {
    const validatedData = await this.validateCreateInput(input);

    const s3Url = `${S3_CONFIG.baseUrl}/${validatedData.s3Key}`;

    const image = new this.model({
      ...validatedData,
      s3Url,
    });

    try {
      return await image.save();
    } catch (error) {
      throw new DatabaseError(`create ${this.resourceName}`, { input: validatedData, error });
    }
  }

  async update(id: string, input: ImageUpdateData): Promise<ImageInterface> {
    const validatedData = await this.validateUpdateInput(input);
    const image = await this.findById(id);

    Object.assign(image, validatedData);

    try {
      return await image.save();
    } catch (error) {
      throw new DatabaseError(`update ${this.resourceName}`, {
        id,
        input: validatedData,
        error,
      });
    }
  }

  async delete(id: string): Promise<void> {
    const image = await this.findByIdRaw(id);

    try {
      await this.deleteFromS3(image.s3Key);
      await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new DatabaseError(`hard delete ${this.resourceName}`, { id, error });
    }
  }

  async createFromUpload(
    file: Express.Multer.File & { key: string; location: string },
  ): Promise<ImageInterface> {
    const imageData: ImageCreateData = {
      filename: file.key.split('/').pop() || file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      s3Key: file.key,
      s3Bucket: S3_CONFIG.bucket,
    };

    return this.create(imageData);
  }

  async createMultipleFromUploads(
    files: (Express.Multer.File & { key: string; location: string })[],
  ): Promise<ImageInterface[]> {
    const images: Promise<ImageInterface>[] = files.map((file) => this.createFromUpload(file));
    return Promise.all(images);
  }

  private buildImageFilter(filter: ImageFilter): FilterQuery<ImageInterface> {
    const mongoFilter: FilterQuery<ImageInterface> = {
      ...this.getBaseFilter(),
    };

    if (filter.mimeType) {
      mongoFilter.mimeType = filter.mimeType;
    }

    if (filter.minSize !== undefined || filter.maxSize !== undefined) {
      mongoFilter.size = {};
      if (filter.minSize !== undefined) mongoFilter.size.$gte = filter.minSize;
      if (filter.maxSize !== undefined) mongoFilter.size.$lte = filter.maxSize;
    }

    if (filter.search) {
      mongoFilter.$or = [
        { filename: new RegExp(filter.search, 'i') },
        { originalName: new RegExp(filter.search, 'i') },
        { altText: new RegExp(filter.search, 'i') },
        { title: new RegExp(filter.search, 'i') },
      ];
    }

    return mongoFilter;
  }

  private async deleteFromS3(s3Key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: S3_CONFIG.bucket,
        Key: s3Key,
      });

      await s3Client.send(command);
    } catch (error) {
      throw new DatabaseError('delete from S3', { s3Key, error });
    }
  }

  private async validateCreateInput(input: ImageCreateData): Promise<ImageCreateData> {
    const result = ImageCreateSchema.safeParse(input);

    if (!result.success) {
      const errors = result.error.issues[0];
      throw new ValidationError(errors.message, {
        field: errors.path.join('.'),
        issues: result.error.issues,
      });
    }

    return result.data;
  }

  private async validateUpdateInput(input: ImageUpdateData): Promise<ImageUpdateData> {
    const result = ImageUpdateSchema.safeParse(input);

    if (!result.success) {
      const errors = result.error.issues[0];
      throw new ValidationError(errors.message, {
        field: errors.path.join('.'),
        issues: result.error.issues,
      });
    }

    return result.data;
  }
}
