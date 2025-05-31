import express, { type Request, type Response } from 'express';
import Product, { type ProductInterface, type ProductRequest } from '../db/models/Products.ts';

const productRoutes = express.Router();

productRoutes.post('/create-product', async (req: Request<ProductInterface>, res: Response): Promise<void> => {
  const product = new Product(req.body);
  try {
    const savedProduct: ProductInterface = await product.save();
    console.info('Product created:', savedProduct);
    res.json(savedProduct).status(201);
  } catch (err) {
    res.status(400).send({ message: 'Failed to create product', error: err });
  }
});

productRoutes.patch('/update-product/:id', async (req: Request<ProductRequest>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await Product.updateOne({ _id: id }, req.body);
    const updatedProduct: ProductInterface | null = await Product.findById(id);
    res.json(updatedProduct).status(200);
  } catch (err) {
    res.status(400).send({ message: 'Failed to update product', error: err });
  }
});

productRoutes.delete('/delete-product/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.deleteOne({ _id: id });
    res.json(deletedProduct).status(200);
  } catch (err) {
    res.status(400).send({ message: 'Failed to delete product', error: err });
  }
});

export default productRoutes;
