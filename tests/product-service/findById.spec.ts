import { describe, it, expect, beforeEach } from '@jest/globals';
import { ProductService } from '../../app/services/ProductService.ts';
import { createProductData } from '../factories/product.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidSlug, expectValidMongoId } from '../helpers/assertions.ts';
import { NotFoundError } from '../../app/errors/ErrorTypes.ts';
import { type ProductInterface } from '../../app/db/models/Product.ts';

describe('ProductService - findById', () => {
  let productService: ProductService;
  let existingProduct: ProductInterface;

  beforeEach(async () => {
    await clearCollection('products');
    productService = new ProductService();
    existingProduct = await productService.create(createProductData());
  });

  it('should find product by valid ID', async () => {
    const found = await productService.findById(existingProduct.id);

    expect(found.id).toBe(existingProduct.id);
    expect(found.title).toBe(existingProduct.title);
    expectValidSlug(found.slug);
    expect(found.variants).toHaveLength(1);
    expectValidMongoId(found.id);
  });

  it('should find product with select options', async () => {
    const found = await productService.findById(existingProduct.id, {
      select: 'title slug status',
    });

    expect(found.title).toBe(existingProduct.title);
    expect(found.slug).toBe(existingProduct.slug);
    expect(found.status).toBe(existingProduct.status);
    expect(found.description).toBeUndefined();
  });

  it('should find product with populate options', async () => {
    // TODO: Update this test when product model has relations
    const found = await productService.findById(existingProduct.id, {
      populate: [],
    });

    expect(found.id).toBe(existingProduct.id);
  });

  it('should throw NotFoundError for non-existent ID', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    await expect(productService.findById(fakeId)).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError for invalid ID format', async () => {
    const invalidId = 'invalid-id';
    await expect(productService.findById(invalidId)).rejects.toThrow();
  });

  it('should not find soft deleted product', async () => {
    await productService.softDelete(existingProduct.id);
    await expect(productService.findById(existingProduct.id)).rejects.toThrow(NotFoundError);
  });
});
