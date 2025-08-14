import type { Document, Types } from 'mongoose';

export interface Product extends Document {
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: Types.ObjectId[];
  categories: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
