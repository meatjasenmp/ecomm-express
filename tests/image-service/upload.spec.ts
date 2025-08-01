import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { setupImageServiceTest, teardownImageServiceTest } from './image-test-helpers.ts';
import { setupS3DeleteTrackingMock } from '../helpers/s3-mock.ts';
import { ImageService, type UploadedFile } from '../../app/services/ImageService.ts';

describe('ImageService - Upload Tests', () => {
  let imageService: ImageService;
  let mockFile: UploadedFile;

  beforeEach(async () => {
    const setup = await setupImageServiceTest();
    imageService = setup.imageService;
    mockFile = setup.mockFile;
  });

  afterEach(() => {
    teardownImageServiceTest();
  });

  describe('createFromUpload', () => {
    it('should create image with all variants', async () => {
      const image = await imageService.createFromUpload(mockFile);

      expect(image).toBeDefined();
      expect(image.filename).toContain('.jpg');
      expect(image.originalName).toBe('test-image.jpg');
      expect(image.mimeType).toBe('image/jpeg');
      expect(image.variants).toBeDefined();
    });

    it('should generate all required variants', async () => {
      const image = await imageService.createFromUpload(mockFile);

      const { variants } = image;
      expect(variants.original).toBeDefined();
      expect(variants.thumbnail).toBeDefined();
      expect(variants.medium).toBeDefined();
      expect(variants.large).toBeDefined();

      expect(variants.original.width).toBe(300);
      expect(variants.original.height).toBe(200);
      expect(variants.original.s3Key).toContain('_original.');
      expect(variants.original.s3Url).toContain(variants.original.s3Key);

      expect(variants.thumbnail.width).toBeLessThanOrEqual(150);
      expect(variants.thumbnail.height).toBeLessThanOrEqual(150);
      expect(variants.thumbnail.s3Key).toContain('_thumbnail.');

      expect(variants.medium.width).toBeLessThanOrEqual(500);
      expect(variants.medium.height).toBeLessThanOrEqual(500);
      expect(variants.medium.s3Key).toContain('_medium.');

      expect(variants.large.width).toBeLessThanOrEqual(1200);
      expect(variants.large.height).toBeLessThanOrEqual(1200);
      expect(variants.large.s3Key).toContain('_large.');
    });

    it('should maintain aspect ratio when resizing', async () => {
      const image = await imageService.createFromUpload(mockFile);
      const { variants } = image;

      const originalRatio = variants.original.width / variants.original.height;
      const thumbnailRatio = variants.thumbnail.width / variants.thumbnail.height;
      const mediumRatio = variants.medium.width / variants.medium.height;
      const largeRatio = variants.large.width / variants.large.height;

      expect(Math.abs(originalRatio - thumbnailRatio)).toBeLessThan(0.1);
      expect(Math.abs(originalRatio - mediumRatio)).toBeLessThan(0.1);
      expect(Math.abs(originalRatio - largeRatio)).toBeLessThan(0.1);
    });

    it('should not enlarge images smaller than variant size', async () => {
      const image = await imageService.createFromUpload(mockFile);
      const { variants } = image;

      expect(variants.large.width).toBeLessThanOrEqual(variants.original.width);
      expect(variants.large.height).toBeLessThanOrEqual(variants.original.height);
    });

    it('should generate different file sizes for different variants', async () => {
      const image = await imageService.createFromUpload(mockFile);
      const { variants } = image;

      expect(variants.thumbnail.size).toBeLessThan(variants.original.size);
      expect(variants.medium.size).toBeLessThanOrEqual(variants.original.size);
      expect(variants.large.size).toBeLessThanOrEqual(variants.original.size);

      expect(variants.original.size).toBeGreaterThan(0);
      expect(variants.thumbnail.size).toBeGreaterThan(0);
      expect(variants.medium.size).toBeGreaterThan(0);
      expect(variants.large.size).toBeGreaterThan(0);
    });
  });

  describe('createMultipleFromUploads', () => {
    it('should handle multiple file uploads', async () => {
      const mockFile2 = {
        ...mockFile,
        key: `uploads/test-2-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`,
        originalname: 'test-image-2.jpg',
      };

      const images = await imageService.createMultipleFromUploads([mockFile, mockFile2]);

      expect(images).toHaveLength(2);
      expect(images[0].originalName).toBe('test-image.jpg');
      expect(images[1].originalName).toBe('test-image-2.jpg');

      expect(images[0].variants).toBeDefined();
      expect(images[1].variants).toBeDefined();
    });

    it('should handle empty array', async () => {
      const images = await imageService.createMultipleFromUploads([]);
      expect(images).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete image and all variants from S3', async () => {
      const image = await imageService.createFromUpload(mockFile);
      const imageId = (image._id as string).toString();

      const deletedKeys = setupS3DeleteTrackingMock();

      await imageService.delete(imageId);

      expect(deletedKeys).toHaveLength(4);
      expect(deletedKeys).toContain(image.variants.original.s3Key);
      expect(deletedKeys).toContain(image.variants.thumbnail.s3Key);
      expect(deletedKeys).toContain(image.variants.medium.s3Key);
      expect(deletedKeys).toContain(image.variants.large.s3Key);

      const deletedImage = await imageService.model.findById(imageId);
      expect(deletedImage).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should find image by id', async () => {
      const createdImage = await imageService.createFromUpload(mockFile);
      const foundImage = await imageService.findById((createdImage._id as string).toString());

      expect((foundImage._id as string).toString()).toBe((createdImage._id as string).toString());
      expect(foundImage.originalName).toBe('test-image.jpg');
      expect(foundImage.variants).toBeDefined();
    });

    it('should find all images with pagination', async () => {
      await imageService.createFromUpload(mockFile);
      await imageService.createFromUpload({
        ...mockFile,
        key: `uploads/test-2-${Date.now()}.jpg`,
        originalname: 'test-image-2.jpg',
      });

      const result = await imageService.findAll({}, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it('should filter images by mime type', async () => {
      await imageService.createFromUpload(mockFile);

      const jpegResults = await imageService.findAll({ mimeType: 'image/jpeg' });
      const pngResults = await imageService.findAll({ mimeType: 'image/png' });

      expect(jpegResults.data).toHaveLength(1);
      expect(pngResults.data).toHaveLength(0);
    });

    it('should filter images by size range', async () => {
      await imageService.createFromUpload(mockFile);

      const largeResults = await imageService.findAll({ minSize: 1000000 });
      const smallResults = await imageService.findAll({ maxSize: 1000000 });

      expect(largeResults.data).toHaveLength(0);
      expect(smallResults.data).toHaveLength(1);
    });

    it('should search images by filename', async () => {
      await imageService.createFromUpload(mockFile);

      const results = await imageService.findAll({ search: 'test-image' });
      const noResults = await imageService.findAll({ search: 'nonexistent' });

      expect(results.data).toHaveLength(1);
      expect(noResults.data).toHaveLength(0);
    });
  });
});
