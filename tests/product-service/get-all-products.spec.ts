import { describe, it, expect, beforeEach } from '@jest/globals';
import { clearDatabase } from '../helpers/database.ts';
import { AdminProductService } from '../../app/services/AdminProductService.ts';
import { createProductData } from '../factories/product.factory.ts';

describe('AdminProductService - getAllProducts', () => {
  let adminProductService: AdminProductService;

  beforeEach(async () => {
    await clearDatabase();
    adminProductService = new AdminProductService();
  });

  describe('findAll', () => {
    it('should return both published and unpublished products', async () => {
      await adminProductService.create(createProductData({ isPublished: true }));
      await adminProductService.create(createProductData({ isPublished: false }));

      const result = await adminProductService.findAll({}, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data.map((p) => p.isPublished)).toEqual(
        expect.arrayContaining([true, false]),
      );
    });

    it('should not return soft deleted products by default', async () => {
      const activeProduct = await adminProductService.create(
        createProductData({ isPublished: true }),
      );
      const deletedProduct = await adminProductService.create(
        createProductData({ isPublished: true }),
      );

      await adminProductService.softDelete((deletedProduct._id as string).toString());

      const result = await adminProductService.findAll({}, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect((result.data[0]._id as string).toString()).toBe(
        (activeProduct._id as string).toString(),
      );
    });

    it('should handle pagination correctly', async () => {
      for (let i = 0; i < 5; i++) {
        await adminProductService.create(createProductData({ isPublished: true }));
      }

      const result = await adminProductService.findAll({}, { page: 1, limit: 3 });

      expect(result.data).toHaveLength(3);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 3,
        total: 5,
        pages: 2,
      });
    });
  });

  describe('filtering', () => {
    it('should filter by status', async () => {
      await adminProductService.create(createProductData({ status: 'active' }));
      await adminProductService.create(createProductData({ status: 'draft' }));

      const result = await adminProductService.findAll(
        { status: 'active' },
        { page: 1, limit: 10 },
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('active');
    });

    it('should filter by productType', async () => {
      await adminProductService.create(createProductData({ productType: 'shoes' }));
      await adminProductService.create(createProductData({ productType: 'clothing' }));

      const result = await adminProductService.findAll(
        { productType: 'shoes' },
        { page: 1, limit: 10 },
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].productType).toBe('shoes');
    });

    it('should filter by gender', async () => {
      await adminProductService.create(createProductData({ gender: 'mens' }));
      await adminProductService.create(createProductData({ gender: 'womens' }));

      const result = await adminProductService.findAll(
        { gender: 'mens' },
        { page: 1, limit: 10 },
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].gender).toBe('mens');
    });

    it('should filter by isPublished', async () => {
      await adminProductService.create(createProductData({ isPublished: true }));
      await adminProductService.create(createProductData({ isPublished: false }));

      const result = await adminProductService.findAll(
        { isPublished: false },
        { page: 1, limit: 10 },
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].isPublished).toBe(false);
    });

    it('should filter by brand (case-insensitive regex)', async () => {
      await adminProductService.create(createProductData({ brand: 'Nike' }));
      await adminProductService.create(createProductData({ brand: 'Adidas' }));

      const result = await adminProductService.findAll(
        { brand: 'nike' },
        { page: 1, limit: 10 },
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].brand).toBe('Nike');
    });

    it('should filter by categories', async () => {
      const categoryId1 = '507f1f77bcf86cd799439011';
      const categoryId2 = '507f1f77bcf86cd799439012';
      const categoryId3 = '507f1f77bcf86cd799439013';

      const product1 = await adminProductService.create(
        createProductData({ categories: [categoryId1, categoryId2] }),
      );
      await adminProductService.create(createProductData({ categories: [categoryId3] }));

      const result = await adminProductService.findAll(
        { categories: [categoryId1] },
        { page: 1, limit: 10 },
      );

      expect(result.data).toHaveLength(1);
      expect((result.data[0]._id as string).toString()).toBe(
        (product1._id as string).toString(),
      );
    });

    it('should filter by search (title, description, tags, searchKeywords)', async () => {
      await adminProductService.create(
        createProductData({
          title: 'Red Shoes',
          description: 'Comfortable footwear',
          tags: ['footwear'],
          searchKeywords: ['running'],
        }),
      );
      await adminProductService.create(
        createProductData({
          title: 'Blue Shirt',
          description: 'Cotton clothing',
          tags: ['clothing'],
          searchKeywords: ['casual'],
        }),
      );

      const titleResult = await adminProductService.findAll(
        { search: 'red' },
        { page: 1, limit: 10 },
      );
      expect(titleResult.data).toHaveLength(1);
      expect(titleResult.data[0].title).toContain('Red');

      const descResult = await adminProductService.findAll(
        { search: 'comfortable' },
        { page: 1, limit: 10 },
      );
      expect(descResult.data).toHaveLength(1);
      expect(descResult.data[0].description).toContain('Comfortable');

      const tagsResult = await adminProductService.findAll(
        { search: 'footwear' },
        { page: 1, limit: 10 },
      );
      expect(tagsResult.data).toHaveLength(1);
      expect(tagsResult.data[0].tags).toContain('footwear');

      const keywordsResult = await adminProductService.findAll(
        { search: 'running' },
        { page: 1, limit: 10 },
      );
      expect(keywordsResult.data).toHaveLength(1);
      expect(keywordsResult.data[0].searchKeywords).toContain('running');
    });

    it('should filter by price range', async () => {
      await adminProductService.create(
        createProductData({
          variants: [
            {
              price: 50,
              sku: 'test-50',
              size: 'M',
              color: 'Black',
              quantity: 10,
              isActive: true,
            },
          ],
        }),
      );
      await adminProductService.create(
        createProductData({
          variants: [
            {
              price: 150,
              sku: 'test-150',
              size: 'L',
              color: 'White',
              quantity: 5,
              isActive: true,
            },
          ],
        }),
      );
      await adminProductService.create(
        createProductData({
          variants: [
            {
              price: 250,
              sku: 'test-250',
              size: 'XL',
              color: 'Red',
              quantity: 3,
              isActive: true,
            },
          ],
        }),
      );

      const minResult = await adminProductService.findAll(
        { minPrice: 100 },
        { page: 1, limit: 10 },
      );
      expect(minResult.data).toHaveLength(2);

      const maxResult = await adminProductService.findAll(
        { maxPrice: 100 },
        { page: 1, limit: 10 },
      );
      expect(maxResult.data).toHaveLength(1);

      const rangeResult = await adminProductService.findAll(
        { minPrice: 100, maxPrice: 200 },
        { page: 1, limit: 10 },
      );
      expect(rangeResult.data).toHaveLength(1);
      expect(rangeResult.data[0].variants[0].price).toBe(150);
    });

    it('should combine multiple filters', async () => {
      await adminProductService.create(
        createProductData({
          brand: 'Nike',
          gender: 'mens',
          isPublished: true,
          status: 'active',
        }),
      );
      await adminProductService.create(
        createProductData({
          brand: 'Nike',
          gender: 'womens',
          isPublished: true,
          status: 'active',
        }),
      );

      const result = await adminProductService.findAll(
        {
          brand: 'nike',
          gender: 'mens',
          isPublished: true,
          status: 'active',
        },
        { page: 1, limit: 10 },
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].brand).toBe('Nike');
      expect(result.data[0].gender).toBe('mens');
      expect(result.data[0].isPublished).toBe(true);
      expect(result.data[0].status).toBe('active');
    });

    it('should filter for unpublished products only', async () => {
      await adminProductService.create(
        createProductData({
          brand: 'Nike',
          isPublished: true,
        }),
      );
      await adminProductService.create(
        createProductData({
          brand: 'Adidas',
          isPublished: false,
        }),
      );
      await adminProductService.create(
        createProductData({
          brand: 'Puma',
          isPublished: false,
        }),
      );

      const result = await adminProductService.findAll(
        { isPublished: false },
        { page: 1, limit: 10 },
      );

      expect(result.data).toHaveLength(2);
      expect(result.data.every((p) => !p.isPublished)).toBe(true);
    });

    it('should exclude soft deleted products from normal queries', async () => {
      const activeProduct = await adminProductService.create(
        createProductData({
          brand: 'Nike',
          isPublished: true,
        }),
      );
      const productToDelete = await adminProductService.create(
        createProductData({
          brand: 'Adidas',
          isPublished: true,
        }),
      );

      await adminProductService.softDelete((productToDelete._id as string).toString());

      const result = await adminProductService.findAll({}, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect((result.data[0]._id as string).toString()).toBe(
        (activeProduct._id as string).toString(),
      );
      expect(result.data[0].brand).toBe('Nike');
    });

    it('should be able to restore soft deleted products by brand', async () => {
      const nikeProduct = await adminProductService.create(
        createProductData({
          brand: 'Nike',
          isPublished: true,
        }),
      );
      const adidasProduct = await adminProductService.create(
        createProductData({
          brand: 'Adidas',
          isPublished: true,
        }),
      );

      await adminProductService.softDelete((nikeProduct._id as string).toString());
      await adminProductService.softDelete((adidasProduct._id as string).toString());

      const activeResult = await adminProductService.findAll({}, { page: 1, limit: 10 });
      expect(activeResult.data).toHaveLength(0);

      const restoredNikeProduct = await adminProductService.restore(
        (nikeProduct._id as string).toString(),
      );
      expect(restoredNikeProduct.brand).toBe('Nike');
      expect(restoredNikeProduct.deletedAt).toBeNull();

      const afterRestoreResult = await adminProductService.findAll(
        { brand: 'nike' },
        { page: 1, limit: 10 },
      );
      expect(afterRestoreResult.data).toHaveLength(1);
      expect(afterRestoreResult.data[0].brand).toBe('Nike');
      expect(afterRestoreResult.data[0].deletedAt).toBeNull();
    });
  });
});
