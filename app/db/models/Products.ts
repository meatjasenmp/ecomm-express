import mongoose, { Types } from 'mongoose';
const { Schema, model } = mongoose;

export type ProductInterface = {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  categories: Types.ObjectId[];
  images: Types.ObjectId[];
  discount?: number;
  isPublished: boolean;
};

const productSchema = new Schema<ProductInterface>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  price: { type: Number, required: true },
  categories: { type: [Schema.Types.ObjectId], ref: 'Category', required: true },
  images: { type: [Schema.Types.ObjectId], ref: 'Image' },
  discount: { type: Number },
  isPublished: { type: Boolean },
});

const Product = model('Product', productSchema);
export default Product;
