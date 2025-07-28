import { describe, it, expect, beforeEach } from '@jest/globals';
import { ProductService } from '../../app/services/ProductService.ts';
import { createProductData } from '../factories/product.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidSlug, expectValidMongoId } from '../helpers/assertions.ts';
import { NotFoundError } from '../../app/errors/ErrorTypes.ts';
import { type ProductInterface } from '../../app/db/models/Product.ts';
import '../../app/db/models/Category.ts';

describe('ProductService - findBySlug', () => {
  let productService: ProductService;
  let existingProduct: ProductInterface;

  beforeEach(async () => {
    await clearCollection('products');
    productService = new ProductService();
    existingProduct = await productService.create(
      createProductData({ title: 'Test Product Name' }),
    );
  });

  it('should find product by valid slug', async () => {
    const found = await productService.findBySlug('test-product-name');

    expect(found.id).toBe(existingProduct.id);
    expect(found.title).toBe('Test Product Name');
    expect(found.slug).toBe('test-product-name');
    expectValidSlug(found.slug);
    expectValidMongoId(found.id);
  });

  it('should find product with select options', async () => {
    const found = await productService.findBySlug('test-product-name', {
      select: 'title slug status',
    });

    expect(found.title).toBe('Test Product Name');
    expect(found.slug).toBe('test-product-name');
    expect(found.status).toBe(existingProduct.status);
    expect(found.description).toBeUndefined();
  });

  it('should find product with populate options', async () => {
    const found = await productService.findBySlug('test-product-name', {
      populate: ['categories'],
    });

    expect(found.id).toBe(existingProduct.id);
    expect(found.slug).toBe('test-product-name');
  });

  it('should throw NotFoundError for non-existent slug', async () => {
    await expect(productService.findBySlug('non-existent-slug')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should not find soft deleted product by slug', async () => {
    await productService.softDelete(existingProduct.id);
    await expect(productService.findBySlug('test-product-name')).rejects.toThrow(
      NotFoundError,
    );
  });
});
