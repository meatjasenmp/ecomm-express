import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../server.ts';
import { clearDatabase } from '../helpers/database.ts';
import { ProductService } from '../../app/services/ProductService.ts';
import { createProductData } from '../factories/product.factory.ts';

describe('Product Endpoints', () => {
  let productService: ProductService;

  beforeEach(async () => {
    await clearDatabase();
    productService = new ProductService();
  });

  describe('Public Product Endpoints', () => {
    describe('GET /products', () => {
      it('should return only published products', async () => {
        const publishedProduct = await productService.create(
          createProductData({ isPublished: true })
        );
        await productService.create(
          createProductData({ isPublished: false })
        );

        const response = await request(app)
          .get('/api/products')
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe((publishedProduct._id as string).toString());
        expect(response.body.data[0].slug).toBe(publishedProduct.slug);
      });

      it('should handle pagination', async () => {
        for (let i = 0; i < 5; i++) {
          await productService.create(createProductData({ isPublished: true }));
        }

        const response = await request(app)
          .get('/api/products?page=1&limit=3')
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.pagination).toEqual({
          page: 1,
          limit: 3,
          total: 5,
          pages: 2,
        });
      });

      it('should return unpublished products when explicitly queried', async () => {
        await productService.create(
          createProductData({ isPublished: true })
        );
        const unpublishedProduct = await productService.create(
          createProductData({ isPublished: false })
        );

        const response = await request(app)
          .get('/api/products?isPublished=false')
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe((unpublishedProduct._id as string).toString());
        expect(response.body.data[0].isPublished).toBe(false);
      });
    });

    describe('GET /products/:slug', () => {
      it('should return published product by slug', async () => {
        const product = await productService.create(
          createProductData({ isPublished: true })
        );

        const response = await request(app)
          .get(`/api/products/${product.slug}`)
          .expect(200);

        expect(response.body.id).toBe((product._id as string).toString());
        expect(response.body.slug).toBe(product.slug);
        expect(response.body.title).toBe(product.title);
      });

      it('should return 404 for unpublished product', async () => {
        const product = await productService.create(
          createProductData({ isPublished: false })
        );

        const response = await request(app)
          .get(`/api/products/${product.slug}`);

        expect(response.status).toBe(404);
      });

    });
  });
});