import mongoose, { Schema, Document } from 'mongoose';
import {
  type ProductStatus,
  type ProductType,
  type Gender,
  type ProductVariant,
} from '../../schemas/products/ProductSchemas.ts';

export interface ProductInterface extends Document {
  title: string;
  description: string;
  shortDescription?: string;
  brand: string;
  productType: ProductType;
  gender: Gender;
  categories: mongoose.Types.ObjectId[];
  tags?: string[];
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  searchKeywords?: string[];
  variants: ProductVariant[];
  images: mongoose.Types.ObjectId[];
  status: ProductStatus;
  isPublished: boolean;
  publishedAt?: Date;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const VariantSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    cost: { type: Number, min: 0 },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    weight: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
);

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 255 },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 500 },
    brand: { type: String, required: true },
    productType: {
      type: String,
      required: true,
      enum: ['shoes', 'clothing', 'accessories'],
    },
    gender: {
      type: String,
      required: true,
      enum: ['mens', 'womens', 'unisex', 'kids'],
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    tags: [{ type: String }],
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 },
    searchKeywords: [{ type: String }],
    variants: [VariantSchema],
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Image',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'draft',
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    sortOrder: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ProductSchema.index({ brand: 1, productType: 1 });
ProductSchema.index({ categories: 1, status: 1 });
ProductSchema.index({ isPublished: 1, publishedAt: -1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ searchKeywords: 1 });
ProductSchema.index({ deletedAt: 1 });
ProductSchema.index({
  productType: 1,
  gender: 1,
  isPublished: 1,
});
ProductSchema.index({ brand: 1, isPublished: 1 });

ProductSchema.virtual('totalInventory').get(function () {
  return (
    this.variants?.reduce((total, variant) => {
      return total + (variant.quantity || 0);
    }, 0) || 0
  );
});

ProductSchema.virtual('priceRange').get(function () {
  if (!this.variants?.length) return null;

  const prices = this.variants
    .map((v) => v.price)
    .filter((p) => p !== undefined);
  if (!prices.length) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max ? { single: min } : { min, max };
});

ProductSchema.virtual('availableSizes').get(function () {
  if (!this.variants?.length) return [];

  return [
    ...new Set(
      this.variants
        .filter((v) => v.isActive && (v.quantity || 0) > 0)
        .map((v) => v.size),
    ),
  ].sort();
});

ProductSchema.virtual('availableColors').get(function () {
  if (!this.variants?.length) return [];

  return [
    ...new Set(
      this.variants
        .filter((v) => v.isActive && (v.quantity || 0) > 0)
        .map((v) => v.color),
    ),
  ].sort();
});

export default mongoose.model<ProductInterface>('Product', ProductSchema);
