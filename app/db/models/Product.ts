import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import categorySchema, { type CategoryInterface } from './Categories.ts';

export interface ProductInterface {
  title: string;
  description: string;
  price: number;
  categories: CategoryInterface[];
  isPublished: boolean;
}

export interface ProductRequest extends ProductInterface {
  id: string;
}

const productSchema = new Schema<ProductInterface>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  categories: { type: [categorySchema], required: true },
  isPublished: { type: Boolean, required: true },
});

const Product = model('Product', productSchema);
export default Product;
