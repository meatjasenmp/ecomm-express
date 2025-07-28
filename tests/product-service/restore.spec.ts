import { describe, it, expect, beforeEach } from '@jest/globals';
import { ProductService } from '../../app/services/ProductService.ts';
import { createProductData } from '../factories/product.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidMongoId } from '../helpers/assertions.ts';
import { NotFoundError } from '../../app/errors/ErrorTypes.ts';
import { type ProductInterface } from '../../app/db/models/Product.ts';

describe('ProductService - restore', () => {
  let productService: ProductService;
  let product: ProductInterface;

  beforeEach(async () => {
    await clearCollection('products');
    productService = new ProductService();
    product = await productService.create(createProductData());
    await productService.softDelete(product.id);
  });

  it('should restore soft deleted product successfully', async () => {
    const restoredProduct = await productService.restore(product.id);

    expect(restoredProduct.id).toBe(product.id);
    expect(restoredProduct.deletedAt).toBeNull();
    expectValidMongoId(restoredProduct.id);
  });

  it('should be findable after restore', async () => {
    await productService.restore(product.id);

    const found = await productService.findById(product.id);
    expect(found.id).toBe(product.id);
    expect(found.deletedAt).toBeNull();
  });

  it('should be findable by slug after restore', async () => {
    await productService.restore(product.id);

    const found = await productService.findBySlug(product.slug);
    expect(found.id).toBe(product.id);
    expect(found.deletedAt).toBeNull();
  });

  it('should appear in findAll results after restore', async () => {
    const anotherProduct = await productService.create(createProductData());

    await productService.restore(product.id);

    const result = await productService.findAll({}, { page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.data.some((p) => p.id === product.id)).toBe(true);
    expect(result.data.some((p) => p.id === anotherProduct.id)).toBe(true);
  });

  it('should throw NotFoundError for non-existent product', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    await expect(productService.restore(fakeId)).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError for invalid ID format', async () => {
    const invalidId = 'invalid-id';
    await expect(productService.restore(invalidId)).rejects.toThrow(NotFoundError);
  });

  it('should handle restoring non-deleted product', async () => {
    const activeProduct = await productService.create(createProductData());

    const restored = await productService.restore(activeProduct.id);
    expect(restored.id).toBe(activeProduct.id);
    expect(restored.deletedAt).toBeNull();
  });

  it('should preserve product data when restored', async () => {
    const originalTitle = product.title;
    const originalBrand = product.brand;
    const originalVariantsLength = product.variants.length;

    const restoredProduct = await productService.restore(product.id);

    expect(restoredProduct.title).toBe(originalTitle);
    expect(restoredProduct.brand).toBe(originalBrand);
    expect(restoredProduct.variants).toHaveLength(originalVariantsLength);
    expect(restoredProduct.deletedAt).toBeNull();
  });

  it('should restore product multiple times without error', async () => {
    const firstRestore = await productService.restore(product.id);
    expect(firstRestore.deletedAt).toBeNull();

    const secondRestore = await productService.restore(product.id);
    expect(secondRestore.deletedAt).toBeNull();
    expect(secondRestore.id).toBe(product.id);
  });
});
