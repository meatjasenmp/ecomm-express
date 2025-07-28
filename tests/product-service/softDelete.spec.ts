import { describe, it, expect, beforeEach } from '@jest/globals';
import { ProductService } from '../../app/services/ProductService.ts';
import { createProductData } from '../factories/product.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { expectValidMongoId } from '../helpers/assertions.ts';
import { NotFoundError } from '../../app/errors/ErrorTypes.ts';
import { type ProductInterface } from '../../app/db/models/Product.ts';

describe('ProductService - softDelete', () => {
  let productService: ProductService;
  let product: ProductInterface;

  beforeEach(async () => {
    await clearCollection('products');
    productService = new ProductService();
    product = await productService.create(createProductData());
  });

  it('should soft delete product successfully', async () => {
    const deletedProduct = await productService.softDelete(product.id);

    expect(deletedProduct.id).toBe(product.id);
    expect(deletedProduct.deletedAt).toBeInstanceOf(Date);
    expect(deletedProduct.deletedAt).not.toBeNull();
    expectValidMongoId(deletedProduct.id);
  });

  it('should not be findable after soft delete', async () => {
    await productService.softDelete(product.id);

    await expect(productService.findById(product.id)).rejects.toThrow(NotFoundError);
  });

  it('should not be findable by slug after soft delete', async () => {
    await productService.softDelete(product.id);

    await expect(productService.findBySlug(product.slug)).rejects.toThrow(NotFoundError);
  });

  it('should not appear in findAll results after soft delete', async () => {
    const anotherProduct = await productService.create(createProductData());
    
    await productService.softDelete(product.id);

    const result = await productService.findAll({}, { page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(anotherProduct.id);
    expect(result.data.every((p) => p.id !== product.id)).toBe(true);
  });

  it('should throw NotFoundError for non-existent product', async () => {
    const fakeId = '507f1f77bcf86cd799439011';

    await expect(productService.softDelete(fakeId)).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError for invalid ID format', async () => {
    const invalidId = 'invalid-id';

    await expect(productService.softDelete(invalidId)).rejects.toThrow(NotFoundError);
  });

  it('should handle soft deleting already soft deleted product', async () => {
    await productService.softDelete(product.id);

    await expect(productService.softDelete(product.id)).rejects.toThrow(NotFoundError);
  });

  it('should preserve product data when soft deleted', async () => {
    const originalTitle = product.title;
    const originalBrand = product.brand;

    const deletedProduct = await productService.softDelete(product.id);

    expect(deletedProduct.title).toBe(originalTitle);
    expect(deletedProduct.brand).toBe(originalBrand);
    expect(deletedProduct.variants).toHaveLength(product.variants.length);
  });
});