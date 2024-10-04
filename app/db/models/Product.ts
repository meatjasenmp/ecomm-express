import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export interface ProductInterface {
  title: string;
  description: string;
  isPublished: boolean;
}

export interface ProductRequest extends ProductInterface {
  id: string;
}

const productSchema = new Schema<ProductInterface>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  isPublished: { type: Boolean, required: true },
});

const Product = model('Product', productSchema);
export default Product;
