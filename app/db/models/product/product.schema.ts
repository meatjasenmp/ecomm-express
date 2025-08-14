import { Schema, model } from 'mongoose';
import type { Product } from './product.model';

const ProductSchema = new Schema<Product>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
    },
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Image',
      },
    ],
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    timestamps: true,
  },
);

ProductSchema.index({ title: 'text', description: 'text' });

ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

ProductSchema.index({ categories: 1, price: 1 });
ProductSchema.index({ categories: 1, createdAt: -1 });

export const ProductModel = model<Product>('Product', ProductSchema);
