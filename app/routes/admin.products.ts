import express, { type Request, type Response } from 'express';
import Product, { type ProductInterface } from '../db/models/Products.ts';
import { validate, validateParams } from '../middleware/validation.ts';
import { ProductSchema, ProductUpdateSchema, IdParamsSchema } from '../validation/schemas.ts';
import type { ProductInput, ProductUpdateInput } from '../validation/schemas.ts';

const productRoutes = express.Router();

productRoutes.post('/create-product', validate(ProductSchema), async (req: Request, res: Response): Promise<void> => {
  const productData: ProductInput = req.body;
  const product = new Product(productData);
  try {
    const savedProduct: ProductInterface = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).send({ message: 'Failed to create product', error: err });
  }
});

productRoutes.patch(
  '/update-product/:id',
  validateParams(IdParamsSchema),
  validate(ProductUpdateSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: ProductUpdateInput = req.body;
    try {
      await Product.updateOne({ _id: id }, updateData);
      const updatedProduct: ProductInterface | null = await Product.findById(id);
      res.status(200).json(updatedProduct);
    } catch (err) {
      res.status(400).send({ message: 'Failed to update product', error: err });
    }
  },
);

productRoutes.delete(
  '/delete-product/:id',
  validateParams(IdParamsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const deletedProduct = await Product.deleteOne({ _id: id });
      res.status(200).json(deletedProduct);
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete product', error: err });
    }
  },
);

export default productRoutes;
