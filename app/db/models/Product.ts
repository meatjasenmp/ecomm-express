import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import { type ImageInterface, imageSchema } from './Images.ts';

export interface ProductInterface {
  _id?: string;
  title: string;
  description: string;
  price: number;
  category_ids: string[];
  images: ImageInterface[];
  discount?: number;
  isPublished: boolean;
}

export interface ProductRequest extends ProductInterface {
  id: string;
}

const productSchema = new Schema<ProductInterface>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category_ids: { type: [String], required: true },
  images: { type: [imageSchema], required: true },
  discount: { type: Number },
  isPublished: { type: Boolean, required: true },
});

const Product = model('Product', productSchema);
export default Product;
