import { describe, it, expect, beforeEach } from '@jest/globals';
import { ProductService } from '../../app/services/ProductService.ts';
import { createProductData } from '../factories/product.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidSlug, expectValidMongoId } from '../helpers/assertions.ts';
import { ValidationError, DuplicateError } from '../../app/errors/ErrorTypes.ts';

describe('ProductService: Create', () => {
  let productService: ProductService;

  beforeEach(async () => {
    await clearCollection('products');
    productService = new ProductService();
  });

  it('should create a product with valid data', async () => {
    const productData = createProductData();

    const product = await productService.create(productData);

    expect(product.title).toBe(productData.title);
    expectValidSlug(product.slug);
    expect(product.isPublished).toBe(false);
    expect(product.publishedAt).toBeUndefined();
    expect(product.variants).toHaveLength(1);
    expectValidMongoId(product.id);
  });

  it('should create a published product with publishedAt date', async () => {
    const productData = createProductData({ isPublished: true });

    const product = await productService.create(productData);

    expect(product.isPublished).toBe(true);
    expect(product.publishedAt).toBeInstanceOf(Date);
  });

  it('should generate unique slug from title', async () => {
    const productData = createProductData({ title: 'Special Product Name!' });

    const product = await productService.create(productData);

    expect(product.slug).toBe('special-product-name');
  });

  it('should throw ValidationError for invalid data', async () => {
    const invalidData = createProductData({ title: '' });

    await expect(productService.create(invalidData)).rejects.toThrow(ValidationError);
  });

  it('should throw DuplicateError for duplicate slug', async () => {
    const productData = createProductData();
    await productService.create(productData);

    await expect(productService.create(productData)).rejects.toThrow(DuplicateError);
  });
});
