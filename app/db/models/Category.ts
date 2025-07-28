import mongoose, { Schema, Document } from 'mongoose';
import { type CategoryStatus } from '../../schemas/categories/CategorySchemas.ts';

export interface CategoryInterface extends Document {
  name: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  parentId?: mongoose.Types.ObjectId;
  image?: mongoose.Types.ObjectId;
  status: CategoryStatus;
  isPublished: boolean;
  publishedAt?: Date;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String },
    shortDescription: { type: String, maxlength: 200 },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: 'Image',
    },
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

CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ status: 1, isPublished: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ deletedAt: 1 });

CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

CategorySchema.virtual('parent', {
  ref: 'Category',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

export default mongoose.model<CategoryInterface>('Category', CategorySchema);
