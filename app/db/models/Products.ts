import mongoose, { Types } from 'mongoose';
const { Schema, model } = mongoose;
import Image, { type ImageInterface } from './Images';

export type ProductInterface = {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  categories: string[];
  images: ImageInterface[];
  discount?: number;
  isPublished: boolean;
};

export interface ProductRequest extends ProductInterface {
  id: string;
}

const productSchema = new Schema<ProductInterface>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  price: { type: Number, required: true },
  categories: { type: [String], required: true },
  images: { type: [Image.schema], required: true },
  discount: { type: Number },
  isPublished: { type: Boolean },
});

const Product = model('Product', productSchema);
export default Product;
