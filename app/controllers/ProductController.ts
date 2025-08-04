import { type Request, type Response, type NextFunction } from 'express';
import { ProductService } from '../services/ProductService.ts';
import { BaseProductController } from './BaseProductController.ts';
import { type QueryOptions } from '../services/types/base.types.ts';

export class ProductController extends BaseProductController {
  protected productService = new ProductService();

  getProductBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const options: QueryOptions = {
        populate: ['categories', 'images'],
      };

      const product = await this.productService.findBySlug(slug, options);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };
}