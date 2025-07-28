import { describe, it, expect, beforeEach } from '@jest/globals';
import { ProductService } from '../../app/services/ProductService.ts';
import { createMultipleProductsData } from '../factories/product.factory.ts';
import { clearCollection } from '../helpers/database.ts';
import { type ProductInterface } from '../../app/db/models/Product.ts';

describe('ProductService - findAll', () => {
  let productService: ProductService;
  let products: ProductInterface[];

  beforeEach(async () => {
    await clearCollection('products');
    productService = new ProductService();

    const productsData = createMultipleProductsData(10);
    products = await Promise.all(productsData.map((data) => productService.create(data)));
  });

  it('should return all products with default pagination', async () => {
    const result = await productService.findAll({}, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(10);
    expect(result.pagination.total).toBe(10);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(20);
    expect(result.pagination.pages).toBe(1);
  });

  it('should filter by brand', async () => {
    const targetBrand = products[0].brand;
    const result = await productService.findAll(
      { brand: targetBrand },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.brand === targetBrand)).toBe(true);
  });

  it('should filter by productType', async () => {
    const targetType = products[0].productType;
    const result = await productService.findAll(
      { productType: targetType },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.productType === targetType)).toBe(true);
  });

  it('should filter by gender', async () => {
    const targetGender = products[0].gender;
    const result = await productService.findAll(
      { gender: targetGender },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.gender === targetGender)).toBe(true);
  });

  it('should filter by status', async () => {
    const targetStatus = products[0].status;
    const result = await productService.findAll(
      { status: targetStatus },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.status === targetStatus)).toBe(true);
  });

  it('should filter by isPublished', async () => {
    const publishedProducts = products.filter((p) => p.isPublished);
    const result = await productService.findAll({ isPublished: true }, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(publishedProducts.length);
    expect(result.data.every((p) => p.isPublished)).toBe(true);
  });

  it('should filter by categories', async () => {
    const categoryId = products[0].categories[0].toString();
    const result = await productService.findAll(
      { categories: [categoryId] },
      { page: 1, limit: 20 },
    );

    expect(result.data).toHaveLength(10);
    expect(
      result.data.every((p) => p.categories.some((cat) => cat.toString() === categoryId)),
    ).toBe(true);
  });

  it('should search in title and description', async () => {
    const searchTerm = products[0].title.split(' ')[0];
    const result = await productService.findAll(
      { search: searchTerm },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(
      result.data.some(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    ).toBe(true);
  });

  it('should handle pagination correctly', async () => {
    const page1 = await productService.findAll({}, { page: 1, limit: 3 });
    const page2 = await productService.findAll({}, { page: 2, limit: 3 });

    expect(page1.data).toHaveLength(3);
    expect(page1.pagination.page).toBe(1);
    expect(page1.pagination.pages).toBe(4);

    expect(page2.data).toHaveLength(3);
    expect(page2.pagination.page).toBe(2);
    expect(page2.pagination.pages).toBe(4);

    const page1Ids = page1.data.map((p) => p.id);
    const page2Ids = page2.data.map((p) => p.id);
    expect(page1Ids.some((id) => page2Ids.includes(id))).toBe(false);
  });

  it('should apply select options', async () => {
    const result = await productService.findAll(
      {},
      { page: 1, limit: 10, select: 'title brand' },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].title).toBeDefined();
    expect(result.data[0].brand).toBeDefined();
    expect(result.data[0].description).toBeUndefined();
  });

  it('should apply sort options', async () => {
    const result = await productService.findAll({}, { page: 1, limit: 20, sort: 'title' });

    expect(result.data).toHaveLength(10);

    const titles = result.data.map((p) => p.title);
    const sortedTitles = [...titles].sort();
    expect(titles).toEqual(sortedTitles);
  });

  it('should combine multiple filters', async () => {
    const targetProduct = products.find((p) => p.isPublished);
    if (!targetProduct) return;

    const result = await productService.findAll(
      {
        brand: targetProduct.brand,
        productType: targetProduct.productType,
        isPublished: true,
      },
      { page: 1, limit: 20 },
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(
      result.data.every(
        (p) =>
          p.brand === targetProduct.brand &&
          p.productType === targetProduct.productType &&
          p.isPublished,
      ),
    ).toBe(true);
  });

  it('should not return soft deleted products', async () => {
    await productService.softDelete(products[0].id);

    const result = await productService.findAll({}, { page: 1, limit: 20 });

    expect(result.data).toHaveLength(9);
    expect(result.data.every((p) => p.id !== products[0].id)).toBe(true);
  });
});
