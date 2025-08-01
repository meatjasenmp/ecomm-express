import { type FilterQuery } from 'mongoose';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import Image from '../db/models/Image.ts';
import { type ImageInterface, type ImageVariants } from '../db/models/Image.ts';
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

export type ImageFilter = {
  mimeType?: string;
  minSize?: number;
  maxSize?: number;
  search?: string;
};

export type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname: string;
  encoding: string;
  destination: string;
  filename: string;
  path: string;
  stream: NodeJS.ReadableStream | null;
  key: string;
  location: string;
};

export class ImageService extends BaseService<ImageInterface> {
  model = Image;
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

    const image = new this.model(validatedData);

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
      if (image.variants) {
        await Promise.all([
          this.deleteFromS3(image.variants.original.s3Key),
          this.deleteFromS3(image.variants.thumbnail.s3Key),
          this.deleteFromS3(image.variants.medium.s3Key),
          this.deleteFromS3(image.variants.large.s3Key),
        ]);
      }
      await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new DatabaseError(`hard delete ${this.resourceName}`, { id, error });
    }
  }

  async createFromUpload(file: UploadedFile): Promise<ImageInterface> {
    const variants = await this.generateImageVariants(file);

    const imageData: ImageCreateData = {
      filename: file.key.split('/').pop() || file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      variants,
    };

    return this.create(imageData);
  }

  async createMultipleFromUploads(files: UploadedFile[]): Promise<ImageInterface[]> {
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
      mongoFilter['variants.original.size'] = {};
      if (filter.minSize !== undefined)
        mongoFilter['variants.original.size'].$gte = filter.minSize;
      if (filter.maxSize !== undefined)
        mongoFilter['variants.original.size'].$lte = filter.maxSize;
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

  private async generateImageVariants(file: UploadedFile): Promise<ImageVariants> {
    const baseKey = file.key.replace(/\.[^/.]+$/, ''); // Remove extension
    const extension = file.key.split('.').pop();

    const sizes = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 500, height: 500 },
      large: { width: 1200, height: 1200 },
    };

    const variants: Partial<ImageVariants> = {};

    const originalBuffer = await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer();

    const originalMetadata = await sharp(originalBuffer).metadata();
    const originalKey = `${baseKey}_original.${extension}`;
    await this.uploadToS3(originalBuffer, originalKey, file.mimetype);

    variants.original = {
      s3Key: originalKey,
      s3Url: `${S3_CONFIG.baseUrl}/${originalKey}`,
      width: originalMetadata.width!,
      height: originalMetadata.height!,
      size: originalBuffer.length,
    };

    for (const [variantName, { width, height }] of Object.entries(sizes)) {
      const variantBuffer = await sharp(file.buffer)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const variantMetadata = await sharp(variantBuffer).metadata();
      const variantKey = `${baseKey}_${variantName}.${extension}`;
      await this.uploadToS3(variantBuffer, variantKey, 'image/jpeg');

      variants[variantName as keyof typeof sizes] = {
        s3Key: variantKey,
        s3Url: `${S3_CONFIG.baseUrl}/${variantKey}`,
        width: variantMetadata.width!,
        height: variantMetadata.height!,
        size: variantBuffer.length,
      };
    }

    return variants as ImageVariants;
  }

  private async uploadToS3(buffer: Buffer, key: string, mimeType: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: S3_CONFIG.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);
    } catch (error) {
      throw new DatabaseError('upload to S3', { key, error });
    }
  }
}
