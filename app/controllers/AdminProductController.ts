import { type Request, type Response, type NextFunction } from 'express';
import { AdminProductService } from '../services/AdminProductService.ts';
import { BaseProductController } from './BaseProductController.ts';
import {
  type ProductCreateData,
  type ProductUpdateData,
} from '../schemas/products/ProductSchemas.ts';
import { type QueryOptions } from '../services/types/base.types.ts';

export class AdminProductController extends BaseProductController {
  protected productService = new AdminProductService();

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const options: QueryOptions = {
        populate: ['categories', 'images'],
      };

      const product = await this.productService.findById(id, options);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productData: ProductCreateData = req.body;
      const product = await this.productService.create(productData);

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const productData: ProductUpdateData = req.body;

      const product = await this.productService.update(id, productData);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.softDelete(id);

      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  restoreProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.restore(id);

      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  addProductImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { imageIds } = req.body;

      if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(400).json({ error: 'imageIds array is required' });
        return;
      }

      const product = await this.productService.addImages(id, imageIds);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  removeProductImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { imageIds } = req.body;

      if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(400).json({ error: 'imageIds array is required' });
        return;
      }

      const product = await this.productService.removeImages(id, imageIds);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  replaceProductImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { imageIds } = req.body;

      if (!imageIds || !Array.isArray(imageIds)) {
        res.status(400).json({ error: 'imageIds array is required' });
        return;
      }

      const product = await this.productService.replaceImages(id, imageIds);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };
}