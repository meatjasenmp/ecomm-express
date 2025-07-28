import { describe, it, expect, beforeEach } from '@jest/globals';
import { ProductService } from '../../app/services/ProductService.ts';
import {
  createProductData,
  createPublishedProductData,
} from '../factories/product.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import {
  ValidationError,
  NotFoundError,
  DuplicateError,
} from '../../app/errors/ErrorTypes.ts';
import { type ProductInterface } from '../../app/db/models/Product.ts';

describe('ProductService: Update', () => {
  let productService: ProductService;
  let existingProduct: ProductInterface;

  beforeEach(async () => {
    await clearCollection('products');
    productService = new ProductService();
    existingProduct = await productService.create(createProductData());
  });

  it('should update product with valid data', async () => {
    const updateData = {
      title: 'Updated Running Shoe',
      description: 'Updated description',
      price: 149.99,
    };

    const updated = await productService.update(existingProduct.id, updateData);

    expect(updated.title).toBe(updateData.title);
    expect(updated.description).toBe(updateData.description);
    expect(updated.slug).toBe('updated-running-shoe');
    expect(updated.id).toBe(existingProduct.id);
  });

  it('should update slug when title changes', async () => {
    const updated = await productService.update(existingProduct.id, {
      title: 'New Product Title',
    });

    expect(updated.slug).toBe('new-product-title');
    expect(updated.slug).not.toBe(existingProduct.slug);
  });

  it('should not update slug when title stays the same', async () => {
    const updated = await productService.update(existingProduct.id, {
      description: 'Only updating description',
    });

    expect(updated.slug).toBe(existingProduct.slug);
  });

  it('should publish an unpublished product', async () => {
    const updated = await productService.update(existingProduct.id, {
      isPublished: true,
    });

    expect(updated.isPublished).toBe(true);
    expect(updated.publishedAt).toBeInstanceOf(Date);
  });

  it('should unpublish a published product', async () => {
    const publishedProduct = await productService.create(createPublishedProductData());

    const updated = await productService.update(publishedProduct.id, {
      isPublished: false,
    });

    expect(updated.isPublished).toBe(false);
    expect(updated.publishedAt).toBeUndefined();
  });

  it('should throw NotFoundError for non-existent product', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    await expect(productService.update(fakeId, { title: 'New Title' })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should throw ValidationError for invalid data', async () => {
    await expect(productService.update(existingProduct.id, { title: '' })).rejects.toThrow(
      ValidationError,
    );
  });

  it('should throw DuplicateError when updating to existing slug', async () => {
    await productService.create(createProductData({ title: 'Another Product' }));

    await expect(
      productService.update(existingProduct.id, { title: 'Another Product' }),
    ).rejects.toThrow(DuplicateError);
  });
});
